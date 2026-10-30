#!/usr/bin/env bash
# Builds the storefront locally and ships it to the VPS over SSH/SFTP.
#
#   ./deploy.sh            build, upload, migrate, (first run: import catalogue + photos), restart
#   ./deploy.sh --nginx    also (re)install the nginx block and SSL certificate for the domain
#
# Needs .env.deploy next to this script (see .env.deploy.example). Only touches:
#   /var/www/swarup-jewellers, the PM2 app "swarup-jewellers",
#   /etc/nginx/sites-available/swarup.rasatech.in (+ its sites-enabled link) and the
#   database swarup_jewellers. No other site, database or file on the server is changed.
set -euo pipefail
cd "$(dirname "$0")"

[[ -f .env.deploy ]] || { echo "Missing .env.deploy (copy .env.deploy.example)"; exit 1; }
# shellcheck disable=SC1091
source .env.deploy
: "${VPS_HOST:?}" "${VPS_USER:?}" "${DOMAIN:?}" "${APP_PORT:=3130}"

APP_DIR=/var/www/swarup-jewellers
# macOS tar: leave Finder metadata out of the archives.
export COPYFILE_DISABLE=1
TAR_FLAGS=()
tar --version 2>/dev/null | grep -q bsdtar && TAR_FLAGS=(--no-xattrs --no-mac-metadata)
RELEASE=$(date +%Y%m%d%H%M%S)
WORK=.deploy
mkdir -p "$WORK"

# One authenticated SSH connection, reused by every ssh/scp/sftp call below.
SSH_OPTS=(-o ControlMaster=auto -o ControlPath="/tmp/swarup-deploy-%C" -o ControlPersist=10m -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30)
if [[ -n "${VPS_PASSWORD:-}" ]]; then
  ASKPASS="$PWD/$WORK/askpass.sh"
  printf '#!/bin/sh\nprintf "%%s" "$VPS_PASSWORD"\n' > "$ASKPASS"
  chmod 700 "$ASKPASS"
  export VPS_PASSWORD SSH_ASKPASS="$ASKPASS" SSH_ASKPASS_REQUIRE=force DISPLAY=${DISPLAY:-:0}
fi
remote() { ssh "${SSH_OPTS[@]}" "$VPS_USER@$VPS_HOST" "$@" </dev/null; }
put() { scp -q "${SSH_OPTS[@]}" "$1" "$VPS_USER@$VPS_HOST:$2"; }

echo "==> Building"
npm install --no-audit --no-fund >/dev/null
npx next build
STAGE="$WORK/release"
rm -rf "$STAGE" && mkdir -p "$STAGE"
cp -R .next/standalone/. "$STAGE/"
mkdir -p "$STAGE/.next" "$STAGE/migration"
cp -R .next/static "$STAGE/.next/static"
cp -R public "$STAGE/public"
cp -R scripts db "$STAGE/"
cp migration/catalog.json "$STAGE/migration/"
rm -f "$STAGE"/.env*
tar "${TAR_FLAGS[@]}" -C "$STAGE" -czf "$WORK/release.tgz" .

echo "==> Uploading release $RELEASE"
remote "mkdir -p $APP_DIR/releases/$RELEASE $APP_DIR/shared/uploads"
put "$WORK/release.tgz" "$APP_DIR/releases/$RELEASE.tgz"
put deploy/ecosystem.config.cjs "$APP_DIR/shared/ecosystem.config.cjs"

if [[ "$(remote "test -f $APP_DIR/shared/uploads/.imported && echo yes || echo no")" == "no" ]]; then
  echo "==> First deploy: uploading migrated product photos"
  [[ -d migration/uploads ]] || npm run images:prepare
  tar "${TAR_FLAGS[@]}" -C migration/uploads -czf "$WORK/uploads.tgz" .
  put "$WORK/uploads.tgz" "$APP_DIR/shared/uploads.tgz"
  remote "tar -xzf $APP_DIR/shared/uploads.tgz -C $APP_DIR/shared/uploads && rm $APP_DIR/shared/uploads.tgz && touch $APP_DIR/shared/uploads/.imported"
fi

if [[ "$(remote "test -f $APP_DIR/shared/.env.production && echo yes || echo no")" == "no" ]]; then
  [[ -f .env.production ]] || { echo "Missing .env.production for the first deploy"; exit 1; }
  put .env.production "$APP_DIR/shared/.env.production"
  remote "chmod 600 $APP_DIR/shared/.env.production"
fi

echo "==> Installing on the server"
remote "set -e
cd $APP_DIR/releases/$RELEASE
tar -xzf ../$RELEASE.tgz && rm ../$RELEASE.tgz
ln -sfn $APP_DIR/shared/.env.production .env.production
# The build machine may not be linux-x64: add sharp's native binary for this server from a cached install.
SHARP_V=\$(node -p \"require('./node_modules/sharp/package.json').version\")
NATIVE=$APP_DIR/shared/native/sharp-\$SHARP_V
if [ ! -d \$NATIVE/node_modules/@img ]; then
  mkdir -p \$NATIVE && npm install --prefix \$NATIVE --no-audit --no-fund --no-save sharp@\$SHARP_V >/dev/null
fi
cp -R \$NATIVE/node_modules/@img/. node_modules/@img/
node scripts/migrate.mjs
node scripts/seed.mjs
ln -sfn $APP_DIR/releases/$RELEASE $APP_DIR/current
if pm2 describe swarup-jewellers >/dev/null 2>&1; then
  pm2 reload $APP_DIR/shared/ecosystem.config.cjs --update-env
else
  pm2 start $APP_DIR/shared/ecosystem.config.cjs
fi
pm2 save >/dev/null
cd $APP_DIR/releases && ls -1t | tail -n +4 | xargs -r rm -rf
"

if [[ "${1:-}" == "--nginx" ]]; then
  echo "==> nginx + SSL for $DOMAIN"
  put deploy/nginx-http.conf "/tmp/$DOMAIN.http.conf"
  put deploy/nginx.conf "/tmp/$DOMAIN.conf"
  remote "set -e
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
  cp /tmp/$DOMAIN.http.conf /etc/nginx/sites-available/$DOMAIN
  ln -sfn /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
  nginx -t && systemctl reload nginx
  certbot certonly --webroot -w /var/www/letsencrypt -d $DOMAIN --non-interactive --agree-tos -m ${CERT_EMAIL:-admin@$DOMAIN} --keep-until-expiring
fi
cp /tmp/$DOMAIN.conf /etc/nginx/sites-available/$DOMAIN
ln -sfn /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
rm -f /tmp/$DOMAIN.conf /tmp/$DOMAIN.http.conf
nginx -t && systemctl reload nginx
"
fi

echo "==> Checking"
sleep 2
remote "curl -s -o /dev/null -w 'app on :$APP_PORT -> %{http_code}\n' http://127.0.0.1:$APP_PORT/"
echo "Deployed release $RELEASE to https://$DOMAIN"

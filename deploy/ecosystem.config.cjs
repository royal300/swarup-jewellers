// PM2 definition for the storefront. Reads secrets from shared/.env.production on the server.
const fs = require("fs");
const path = require("path");

const root = "/var/www/swarup-jewellers";
const env = {};
const file = path.join(root, "shared", ".env.production");
if (fs.existsSync(file)) {
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
}

module.exports = {
  apps: [
    {
      name: "swarup-jewellers",
      cwd: path.join(root, "current"),
      script: "server.js",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "350M",
      env: { ...env, NODE_ENV: "production", PORT: "3130", HOSTNAME: "127.0.0.1" },
    },
  ],
};

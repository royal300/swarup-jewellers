import { getSettings } from "@/lib/settings";
import { changePassword, updateSettings } from "../../actions";
import { ActionForm } from "@/components/admin/ActionForm";

export const metadata = { title: "Shop details" };

export default async function SettingsAdmin() {
  const s = await getSettings();
  return (
    <div className="adm-page">
      <header className="adm-head">
        <h1>Shop details</h1>
      </header>
      <section className="adm-panel">
        <h2>Contact and address</h2>
        <ActionForm action={updateSettings} submit="Save details">
          <div className="adm-row">
            <label className="adm-field">
              <span>Phone (as shown)</span>
              <input name="phone" defaultValue={s.phone} required />
            </label>
            <label className="adm-field">
              <span>WhatsApp number with country code</span>
              <input name="whatsapp" defaultValue={s.whatsapp} inputMode="numeric" required />
            </label>
          </div>
          <label className="adm-field">
            <span>Email</span>
            <input name="email" type="email" defaultValue={s.email} />
          </label>
          <label className="adm-field">
            <span>Address</span>
            <textarea name="address" rows={2} defaultValue={s.address} />
          </label>
          <div className="adm-row">
            <label className="adm-field">
              <span>Opening hours</span>
              <input name="hours" defaultValue={s.hours} />
            </label>
            <label className="adm-field">
              <span>Google Maps link</span>
              <input name="map_url" defaultValue={s.mapUrl} />
            </label>
          </div>
          <div className="adm-row">
            <label className="adm-field">
              <span>Facebook page</span>
              <input name="facebook" defaultValue={s.facebook} placeholder="https://" />
            </label>
            <label className="adm-field">
              <span>Instagram</span>
              <input name="instagram" defaultValue={s.instagram} placeholder="https://" />
            </label>
            <label className="adm-field">
              <span>YouTube</span>
              <input name="youtube" defaultValue={s.youtube} placeholder="https://" />
            </label>
          </div>
        </ActionForm>
      </section>
      <section className="adm-panel">
        <h2>Change your password</h2>
        <ActionForm action={changePassword} submit="Change password">
          <label className="adm-field">
            <span>Current password</span>
            <input name="current" type="password" autoComplete="current-password" required />
          </label>
          <div className="adm-row">
            <label className="adm-field">
              <span>New password</span>
              <input name="next" type="password" autoComplete="new-password" minLength={10} required />
            </label>
            <label className="adm-field">
              <span>New password again</span>
              <input name="confirm" type="password" autoComplete="new-password" minLength={10} required />
            </label>
          </div>
        </ActionForm>
      </section>
    </div>
  );
}

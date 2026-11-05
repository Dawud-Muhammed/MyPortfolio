import { Link } from "react-router-dom";
import { useProfile, useSocialLinks, useWebsiteSettings } from "../lib/queries";
export function Footer() {
  const { data: profile } = useProfile();
  const { data: settings } = useWebsiteSettings();
  const { data: socials } = useSocialLinks();
  return (
    <footer className="studio-footer section-container">
      <div>
        <Link to="/" className="footer-signature">
          d.
        </Link>
        <span>
          © {new Date().getFullYear()} {profile?.name || "Dawud Muhammed"}
        </span>
      </div>
      <nav aria-label="Social and contact links">
        {socials
          .filter((s) => s.is_visible && /^https:\/\//.test(s.url))
          .slice(0, 3)
          .map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
              {s.platform} ↗
            </a>
          ))}
        <Link to="/contact">Let’s talk ↗</Link>
      </nav>
      {settings?.footer_tagline && <small>{settings.footer_tagline}</small>}
    </footer>
  );
}

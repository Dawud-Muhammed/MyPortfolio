import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigationItems, useWebsiteSettings } from "../lib/queries";
import { safeUrl } from "../lib/utils";
import { useTheme } from "./ThemeProvider";
const paths = [
  "/",
  "/about",
  "/projects",
  "/services",
  "/blog",
  "/gallery",
  "/contact",
];
const labels = [
  "Home",
  "About",
  "Projects",
  "Services",
  "Blog",
  "Gallery",
  "Contact",
];
export function Navbar() {
  const { data } = useNavigationItems();
  const { data: settings } = useWebsiteSettings();
  const [failedLogo, setFailedLogo] = useState<string | null>(null);
  const siteName = settings?.site_name?.trim() || "DAWUD";
  const logo = safeUrl(settings?.logo_url);
  const { preference, setPreference } = useTheme();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const published = data.filter(
    (n) => n.location === "navbar" && n.is_visible && paths.includes(n.target),
  );
  const items = published.length
    ? published
    : paths.map((target, i) => ({ target, label: labels[i] }));
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) {
      dialog.current.close();
      trigger.current?.focus();
    }
  }, [open]);
  const links = items.map((item) => (
    <NavLink
      key={item.target}
      to={item.target}
      end={item.target === "/"}
      onClick={() => setOpen(false)}
      className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
    >
      {item.label}
    </NavLink>
  ));
  return (
    <header className="studio-header">
      <div className="section-container header-inner">
        <Link
          to="/"
          className="studio-brand"
          aria-label={`${siteName} — home`}
          style={{ minWidth: 0, maxWidth: 180 }}
        >
          {logo && failedLogo !== logo ? (
            <img
              src={logo}
              alt=""
              width={36}
              height={36}
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
                flexShrink: 0,
              }}
              onError={() => setFailedLogo(logo)}
            />
          ) : (
            <span className="brand-symbol">d.</span>
          )}
          <span style={{ minWidth: 0 }}>
            <span
              title={siteName}
              style={{
                display: "block",
                maxWidth: 120,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {siteName}
            </span>
            <span className="brand-sub">SYSTEMS STUDIO</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links}
        </nav>
        <div className="header-controls">
          <label className="sr-only" htmlFor="theme">
            Color theme
          </label>
          <select
            id="theme"
            className="theme-select"
            value={preference}
            onChange={(e) =>
              setPreference(e.target.value as "light" | "dark" | "system")
            }
          >
            <option value="system">◐ System</option>
            <option value="light">☼ Light</option>
            <option value="dark">☾ Dark</option>
          </select>
          <button
            ref={trigger}
            className="menu-toggle icon-button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={22} />
          </button>
        </div>
        <dialog
          ref={dialog}
          className="mobile-menu"
          aria-label="Main navigation"
          onCancel={() => setOpen(false)}
          onClick={(e) => {
            if (e.target === dialog.current) setOpen(false);
          }}
        >
          <button
            className="icon-button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
          <nav aria-label="Mobile navigation">{links}</nav>
        </dialog>
      </div>
    </header>
  );
}

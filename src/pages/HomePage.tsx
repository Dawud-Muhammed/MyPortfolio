import { Link } from "react-router-dom";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useHeroContent,
  useProfile,
  useProjects,
  useSeoSettings,
} from "../lib/queries";
import { SeoHead } from "../components/SeoHead";
import { GitHubContributionGraph } from "../components/GitHubContributionGraph";
import { safeUrl } from "../lib/utils";
export function HomePage() {
  const { data: profile } = useProfile();
  const { data: hero } = useHeroContent();
  const { data: seoSettings } = useSeoSettings();
  const { data: projects, loading, error } = useProjects();
  const featured = useMemo(
    () => projects.filter((p) => p.is_featured).slice(0, 3),
    [projects],
  );
  const [selected, setSelected] = useState<string>("");
  const active = featured.find((p) => p.id === selected) || featured[0];
  const name = profile?.name || "Dawud Muhammed";
  const nameParts = name.trim().split(/\s+/);
  const portrait = safeUrl(profile?.profile_picture_url);
  const [failedPortrait, setFailedPortrait] = useState<string | null>(null);
  return (
    <>
      <SeoHead
        title="Systems Studio"
        description={
          seoSettings?.meta_description ||
          "Dawud Muhammed — Ethiopian developer with a backend focus. Explore the systems, applications, and decisions behind his work."
        }
        seoSettings={seoSettings}
      />
      <section
        className="studio-hero section-container"
        aria-labelledby="hero-title"
      >
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-square" />
            {hero?.kicker || "INDEPENDENT THINKING. CONNECTED SYSTEMS."}
          </p>
          <div className="hero-intro">
            {portrait && failedPortrait !== portrait && (
              <img
                src={portrait}
                alt={name}
                width={52}
                height={52}
                onError={() => setFailedPortrait(portrait)}
              />
            )}
            <div>
              <span className="hero-hello">Hey, I’m</span>
              <span className="hero-role">
                {profile?.title || "Backend developer · Full-stack builder"}
              </span>
            </div>
          </div>
          <h1 id="hero-title">
            {nameParts.length > 1 ? (
              <>
                {nameParts.slice(0, -1).join(" ")}
                <span className="hero-name-outline">
                  {nameParts[nameParts.length - 1]}
                  <span className="hero-name-period">.</span>
                </span>
              </>
            ) : (
              name
            )}
          </h1>
          <p className="hero-statement">
            {hero?.headline ? (
              hero.highlighted_word &&
              hero.headline.includes(hero.highlighted_word) ? (
                hero.headline.split(hero.highlighted_word).map((part, i) => (
                  <span key={i} style={{ color: "inherit" }}>
                    {i > 0 && <span>{hero.highlighted_word}</span>}
                    {part}
                  </span>
                ))
              ) : (
                hero.headline
              )
            ) : (
              <>
                Thoughtful interfaces.
                <br />
                Serious engineering.
              </>
            )}
          </p>
          <p className="hero-description">
            {hero?.subheadline ||
              "An Ethiopian developer with a backend focus. I connect solid architecture with considered interfaces to make useful software."}
          </p>
          <div className="hero-actions">
            <Link to="/projects" className="studio-button primary">
              View Selected Work <ArrowUpRight size={18} />
            </Link>
            <Link to="/contact" className="studio-button">
              Contact Me <ArrowUpRight size={18} />
            </Link>
          </div>
          {hero?.availability_status && hero.availability_label && (
            <p className="availability">
              <span
                className={
                  hero.availability_status ? "available-dot" : "tiny-square"
                }
              />
              {hero.availability_label}
            </p>
          )}
          {profile?.location && (
            <p className="hero-location">
              <MapPin size={13} aria-hidden="true" />
              {profile.location}
              <span>·</span>
              <Link to="/about">
                A little about me <ArrowUpRight size={13} />
              </Link>
            </p>
          )}
        </div>
        <GitHubContributionGraph />
      </section>
      <section
        className="selected-work section-container"
        id="selected-work"
        aria-labelledby="work-title"
      >
        <div className="section-topline">
          <h2 id="work-title">
            Selected work{" "}
            <span>/ {String(featured.length).padStart(2, "0")}</span>
          </h2>
          <Link to="/projects">
            All projects <ArrowUpRight size={15} />
          </Link>
        </div>
        {featured.length > 0 ? (
          <>
            <div
              className="project-selectors"
              aria-label="Select a featured project"
            >
              {featured.map((project, i) => (
                <button
                  key={project.id}
                  aria-pressed={active?.id === project.id}
                  onClick={() => setSelected(project.id)}
                >
                  <span>0{i + 1}</span>
                  {project.title}
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
            {active && (
              <article className="selected-project" key={active.id}>
                <div>
                  <p className="eyebrow">
                    {active.category?.name || "SELECTED PROJECT"} ·{" "}
                    {active.status}
                  </p>
                  <h3>
                    <Link to={`/projects/${active.slug}`}>{active.title}</Link>
                  </h3>
                  <p>{active.excerpt || active.description.slice(0, 210)}</p>
                  <Link className="text-link" to={`/projects/${active.slug}`}>
                    Explore the case study <ArrowUpRight size={16} />
                  </Link>
                </div>
                {active.cover_image_url && (
                  <Link
                    to={`/projects/${active.slug}`}
                    className="selected-image"
                  >
                    <img
                      src={active.cover_image_url}
                      alt={`${active.title} interface`}
                      loading="lazy"
                      width="720"
                      height="450"
                    />
                  </Link>
                )}
              </article>
            )}
          </>
        ) : (
          <p className="collection-note" role="status">
            {loading
              ? "Loading selected work…"
              : error
                ? "Selected work is temporarily unavailable. You can still get in touch."
                : "Selected projects will appear here when published."}{" "}
            <Link to="/projects">Browse work ↗</Link>
          </p>
        )}
      </section>
    </>
  );
}

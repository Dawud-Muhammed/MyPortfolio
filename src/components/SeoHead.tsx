import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { safeUrl } from "../lib/utils";
import type { SeoSettings } from "../lib/types";

export function SeoHead({
  title,
  description,
  image,
  seoSettings,
  noindex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  seoSettings?: SeoSettings | null;
  noindex?: boolean;
}) {
  const { pathname } = useLocation();
  useEffect(() => {
    const template = seoSettings?.site_title_template || "%s | Dawud Muhammed";
    const fullTitle = title
      ? template.includes("%s")
        ? template.replace("%s", title)
        : `${title} | ${template}`
      : "Dawud Muhammed — Full-Stack Software Engineer";
    const metaDesc =
      description ||
      seoSettings?.meta_description ||
      "Full-stack software engineer building delightful digital experiences.";

    document.title = fullTitle;

    const setMeta = (
      name: string,
      content: string,
      attr: "name" | "property" = "name",
    ) => {
      let el = document.querySelector(
        `meta[${attr}="${name}"]`,
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", metaDesc);
    setMeta("robots", noindex ? "noindex,nofollow" : "index,follow");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", metaDesc, "property");
    setMeta("og:type", "website", "property");

    const ogImage = safeUrl(image || seoSettings?.og_image_url) || "";
    if (ogImage) {
      setMeta("og:image", ogImage, "property");
      setMeta("twitter:image", ogImage);
    } else {
      document.querySelector('meta[property="og:image"]')?.remove();
      document.querySelector('meta[name="twitter:image"]')?.remove();
    }
    setMeta("twitter:card", ogImage ? "summary_large_image" : "summary");
    const canonical = new URL(
      pathname,
      import.meta.env.VITE_SITE_URL || "https://dawud-muhammed.vercel.app",
    ).href;
    let link = document.querySelector<HTMLLinkElement>("link[rel=canonical]");
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
    setMeta("og:url", canonical, "property");
    // Initial HTML may contain a ProfilePage or Article from a different route.
    // Replace that owned document metadata on every client-side navigation.
    document.head
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((element) => element.remove());
    let structured: HTMLScriptElement | undefined;
    if (!noindex) {
      structured = document.createElement("script");
      structured.id = "portfolio-structured-data";
      structured.type = "application/ld+json";
      structured.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title || fullTitle,
        description: metaDesc,
        url: canonical,
      }).replace(/</g, "\\u003c");
      document.head.appendChild(structured);
    }
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", metaDesc);
    if (seoSettings?.twitter_handle) {
      setMeta("twitter:site", seoSettings.twitter_handle);
    } else {
      document.querySelector('meta[name="twitter:site"]')?.remove();
    }
    if (seoSettings?.gsc_verification?.trim()) {
      setMeta("google-site-verification", seoSettings.gsc_verification.trim());
    } else {
      document.querySelector('meta[name="google-site-verification"]')?.remove();
    }
    return () => structured?.remove();
  }, [title, description, image, seoSettings, pathname, noindex]);

  return null;
}

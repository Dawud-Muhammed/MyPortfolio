import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { PortfolioGuide } from "./components/PortfolioGuide";
import { HomePage } from "./pages/HomePage";
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const ProjectsPage = lazy(() =>
  import("./pages/ProjectsPage").then((m) => ({ default: m.ProjectsPage })),
);
const ProjectDetailPage = lazy(() =>
  import("./pages/ProjectDetailPage").then((m) => ({
    default: m.ProjectDetailPage,
  })),
);
const ServicesPage = lazy(() =>
  import("./pages/ServicesPage").then((m) => ({ default: m.ServicesPage })),
);
const BlogPage = lazy(() =>
  import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })),
);
const BlogDetailPage = lazy(() =>
  import("./pages/BlogDetailPage").then((m) => ({ default: m.BlogDetailPage })),
);
const GalleryPage = lazy(() =>
  import("./pages/GalleryPage").then((m) => ({ default: m.GalleryPage })),
);
const ContactPage = lazy(() =>
  import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const AdminLoginPage = lazy(() =>
  import("./pages/admin/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  })),
);
const AdminLayout = lazy(() =>
  import("./pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const AdminOverview = lazy(() =>
  import("./pages/admin/AdminOverview").then((m) => ({
    default: m.AdminOverview,
  })),
);
const AdminProjects = lazy(() =>
  import("./pages/admin/AdminProjects").then((m) => ({
    default: m.AdminProjects,
  })),
);
const AdminBlog = lazy(() =>
  import("./pages/admin/AdminBlog").then((m) => ({ default: m.AdminBlog })),
);
const AdminMessages = lazy(() =>
  import("./pages/admin/AdminMessages").then((m) => ({
    default: m.AdminMessages,
  })),
);
const AdminSkills = lazy(() =>
  import("./pages/admin/AdminSkills").then((m) => ({ default: m.AdminSkills })),
);
const AdminSettings = lazy(() =>
  import("./pages/admin/AdminSettings").then((m) => ({
    default: m.AdminSettings,
  })),
);
const AdminAssistant = lazy(() =>
  import("./pages/admin/AdminAssistant").then((m) => ({
    default: m.AdminAssistant,
  })),
);
const AdminCollections = lazy(() =>
  import("./pages/admin/AdminCollections").then((m) => ({
    default: m.AdminCollections,
  })),
);
const adminCollections = [
  "Experience",
  "Education",
  "Certifications",
  "Services",
  "Testimonials",
  "Gallery",
  "Achievements",
  "Faqs",
  "SocialLinks",
  "Navigation",
] as const;
const collections = adminCollections.map((name) => ({
  path: name === "SocialLinks" ? "social" : name.toLowerCase(),
  Component: lazy(() =>
    import("./pages/admin/AdminCrudPages").then((m) => ({
      default: m[`Admin${name}`],
    })),
  ),
}));
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
function PublicLayout() {
  const { pathname } = useLocation();
  return (
    <>
      {import.meta.env.MODE === "public-preview" && (
        <p className="preview-notice">
          Local review · Read-only public CMS snapshot · Live AI and submissions
          disabled
        </p>
      )}
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Suspense
          fallback={
            <p className="route-loading" role="status">
              Loading page…
            </p>
          }
        >
          <div className="route-frame" key={pathname}>
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
      <PortfolioGuide />
    </>
  );
}
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense
          fallback={
            <p className="route-loading" role="status">
              Loading…
            </p>
          }
        >
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:slug" element={<ProjectDetailPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogDetailPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="admin/login" element={<AdminLoginPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="skills" element={<AdminSkills />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="assistant" element={<AdminAssistant />} />
              <Route path="collections" element={<AdminCollections />} />
              {collections.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

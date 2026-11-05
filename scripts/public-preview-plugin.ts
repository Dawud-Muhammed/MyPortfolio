import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

/** Local, read-only review mode. Never installed in a production build. */
export function publicPreviewPlugin(): Plugin {
  const snapshot = JSON.parse(
    readFileSync(
      new URL("../docs/live-public-snapshot.local.json", import.meta.url),
      "utf8",
    ),
  );
  const tables: Record<string, Record<string, unknown>[]> = Object.fromEntries(
    Object.entries(snapshot.collections).map(([table, rows]) => [
      table,
      Array.isArray(rows)
        ? rows.map((row) => ({
            ...row,
            is_published: true,
            publication_status: /^(draft|private)$/i.test(
              String(row.status || ""),
            )
              ? "draft"
              : "published",
          }))
        : [],
    ]),
  );
  return {
    name: "read-only-public-cms-preview",
    config: () => ({
      define: {
        "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
          "http://127.0.0.1:5175",
        ),
        "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
          "local-read-only-snapshot",
        ),
      },
    }),
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url || "/", "http://127.0.0.1:5175");
        if (
          !url.pathname.startsWith("/rest/v1/") &&
          !url.pathname.startsWith("/auth/v1/") &&
          !url.pathname.startsWith("/api/")
        )
          return next();
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end(
            JSON.stringify({
              message:
                "This local public-content preview is read-only. Use an isolated configured database to edit or submit.",
            }),
          );
          return;
        }
        if (url.pathname === "/api/assistant") {
          res.end(
            JSON.stringify({
              enabled: false,
              portrait_url: tables.profile?.[0]?.profile_picture_url || null,
              faqs: [],
              suggested_questions: [],
              revision: snapshot.checkedAt,
            }),
          );
          return;
        }
        if (!url.pathname.startsWith("/rest/v1/")) {
          res.statusCode = 503;
          res.end(
            JSON.stringify({
              message: "Not available in a read-only preview.",
            }),
          );
          return;
        }
        const table = url.pathname.split("/").pop() || "";
        let rows = [...(tables[table] || [])].filter((row) =>
          [...url.searchParams].every(
            ([column, value]) =>
              !value.startsWith("eq.") ||
              String(row[column]) === value.slice(3),
          ),
        );
        const orders = (url.searchParams.get("order") || "")
          .split(",")
          .filter(Boolean)
          .map((order) => order.split("."));
        if (orders.length)
          rows.sort((a, b) => {
            for (const [column, direction] of orders) {
              const difference = String(a[column] ?? "").localeCompare(
                String(b[column] ?? ""),
                undefined,
                { numeric: true },
              );
              if (difference)
                return difference * (direction === "desc" ? -1 : 1);
            }
            return 0;
          });
        if (url.searchParams.has("limit"))
          rows = rows.slice(0, Number(url.searchParams.get("limit")) || 500);
        res.end(JSON.stringify(rows));
      });
    },
  };
}

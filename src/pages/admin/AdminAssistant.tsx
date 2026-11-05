import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { invalidatePublicContent } from "../../lib/queries";
import { safeUrl } from "../../lib/utils";
import type { AssistantSettings } from "../../lib/types";
import { FileUploader } from "../../components/admin/FileUploader";

type Usage = {
  day_usd: number;
  month_usd: number;
  total_usd: number;
  pending_requests: number;
};
export function AdminAssistant() {
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [status, setStatus] = useState("Loading guide configuration…");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [readiness, setReadiness] = useState<{
    enabled: boolean;
    reason?: string;
  } | null>(null);
  async function checkChat() {
    try {
      const response = await fetch("/api/assistant", {
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw Error();
      setReadiness(await response.json());
    } catch {
      setReadiness({ enabled: false, reason: "endpoint_unavailable" });
    }
  }
  useEffect(() => {
    void checkChat();
  }, []);
  const readinessMessages: Record<string, string> = {
    ready:
      "Chat configuration is ready. A real question still needs valid OpenAI account access and working usage controls.",
    server_configuration:
      "Set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL (or VITE_SUPABASE_URL) in Vercel Production, then redeploy. The browser anonymous key cannot replace the server service-role key.",
    settings_configuration:
      "The server cannot read assistant_settings. Check that its Supabase key belongs to the correct project and that the Systems Studio migration is applied.",
    content_configuration:
      "The content revision is unavailable. Verify content_revision and the server Supabase credentials.",
    model_or_limits_configuration:
      "Check ASSISTANT_MODEL and the positive server spending limits.",
    server_disabled:
      "Set ASSISTANT_ENABLED=true in the deployed environment and redeploy.",
    owner_disabled: "Enable paid text answers below and save.",
    pricing_unverified:
      "The current release requires ASSISTANT_PRICING_VERIFIED=2026-11-05 after reviewing pricing.",
    api_key_missing:
      "OPENAI_API_KEY is missing from the server environment. Set it in Vercel and redeploy.",
    session_secret_invalid:
      "ASSISTANT_SESSION_SECRET must contain at least 32 characters. Use a random server-only value, then redeploy.",
    endpoint_unavailable:
      "The chat endpoint cannot be reached. Check the Vercel function deployment.",
    legacy_endpoint:
      "Deploy the current API to see readiness details, then refresh this check.",
  };
  useEffect(() => {
    let active = true;
    void (async () => {
      const [config, totals] = await Promise.all([
        supabase.from("assistant_settings").select("*").eq("id", true).single(),
        supabase.rpc("assistant_usage_summary"),
      ]);
      if (!active) return;
      setSettings(config.data);
      setUsage(totals.data);
      setError(config.error?.message || totals.error?.message || "");
      setStatus("");
    })();
    return () => {
      active = false;
    };
  }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) return;
    setError("");
    setStatus("");
    if (settings.portrait_url && !safeUrl(settings.portrait_url)) {
      setError("Use a valid HTTP(S) URL for the portrait.");
      return;
    }
    if (
      settings.suggested_questions.length > 8 ||
      settings.suggested_questions.some((q) => q.length > 180)
    ) {
      setError(
        "Use up to eight suggested questions, each under 180 characters.",
      );
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("assistant_settings")
      .update({
        enabled: settings.enabled,
        portrait_url: settings.portrait_url || null,
        suggested_questions: settings.suggested_questions,
      })
      .eq("id", true);
    setSaving(false);
    if (error) setError(error.message);
    else {
      invalidatePublicContent();
      setStatus("Guide settings saved.");
      void checkChat();
    }
  }
  async function kill() {
    setSaving(true);
    const { error } = await supabase
      .from("assistant_settings")
      .update({ enabled: false })
      .eq("id", true);
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSettings((previous) =>
        previous ? { ...previous, enabled: false } : null,
      );
      invalidatePublicContent();
      setStatus(
        "Paid requests are disabled. Published FAQ and contact paths remain available.",
      );
    }
  }
  return (
    <main className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-3">AI portfolio guide</h1>
      <p className="text-foreground/70 mb-6">
        Approve knowledge explicitly in Projects, Services, Experience, FAQs and
        Profile settings. Drafts are excluded, even if eligible. No visitor
        conversations are stored in the CMS.
      </p>
      {error && (
        <p role="alert" className="border border-error-500 p-4 rounded-xl mb-4">
          {error}
        </p>
      )}
      {status && (
        <p role="status" className="mb-4">
          {status}
        </p>
      )}
      <section className="glass rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-lg mb-3">Chat readiness</h2>
        <p role="status">
          {readiness
            ? readinessMessages[
                readiness.reason ||
                  (readiness.enabled ? "ready" : "legacy_endpoint")
              ] || "Chat is unavailable. Inspect the server configuration log."
            : "Checking deployed chat configuration…"}
        </p>
        <button
          type="button"
          className="btn-ghost mt-3"
          onClick={() => void checkChat()}
        >
          Refresh chat status
        </button>
      </section>
      <section className="glass rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="font-semibold text-lg">Usage estimates</h2>
            <p className="text-sm text-foreground/70">
              Application estimates, not your provider balance. Pending requests
              remain reserved until safely reconciled.
            </p>
          </div>
          <button
            disabled={saving}
            className="btn-ghost text-error-400"
            onClick={() => void kill()}
          >
            Disable paid requests now
          </button>
        </div>
        {usage ? (
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-5 mt-5">
            {[
              ["Today", usage.day_usd],
              ["This month", usage.month_usd],
              ["Total allocated use", usage.total_usd],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <dt className="text-sm text-foreground/70">{label}</dt>
                <dd className="text-2xl mt-1">${Number(value).toFixed(4)}</dd>
              </div>
            ))}
            <div>
              <dt className="text-sm text-foreground/70">Pending requests</dt>
              <dd className="text-2xl mt-1">{usage.pending_requests}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4">
            Usage unavailable. Check migrations and administrator access.
          </p>
        )}
        <p className="text-sm text-foreground/70 mt-5">
          Limits are enforced in server configuration: proposed defaults
          $0.50/day, $5/month, $10 total. Change environment limits and redeploy
          to adjust them; public CMS fields cannot override budget or model
          safeguards.
        </p>
      </section>
      {settings && (
        <form onSubmit={save} className="glass rounded-2xl p-5 space-y-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-6 h-6"
              checked={settings.enabled}
              onChange={(e) =>
                setSettings({ ...settings, enabled: e.target.checked })
              }
            />
            Enable paid text answers (server configuration must also be ready)
          </label>
          <FileUploader
            bucket="portfolio-images"
            folder="assistant"
            value={settings.portrait_url || ""}
            onChange={(portrait_url) =>
              setSettings({ ...settings, portrait_url })
            }
            label="Guide portrait (leave empty to use the profile portrait)"
          />
          <label className="block">
            Suggested questions (one per line)
            <textarea
              className="input-field mt-2"
              rows={6}
              value={settings.suggested_questions.join("\n")}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  suggested_questions: e.target.value.split("\n"),
                })
              }
            />
          </label>
          <p className="text-sm text-foreground/70">
            Version 1 supports typed questions and text answers only.
          </p>
          <button className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save guide settings"}
          </button>
          <Link to="/admin/faqs" className="btn-ghost ml-3">
            Edit approved FAQs
          </Link>
        </form>
      )}
    </main>
  );
}

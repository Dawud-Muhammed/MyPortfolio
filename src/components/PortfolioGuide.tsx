import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ArrowUpRight, X } from "lucide-react";
import { safeUrl } from "../lib/utils";
import { useProfile } from "../lib/queries";
type Source = { id: string; title: string; url: string };
type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};
type Config = {
  enabled: boolean;
  greeting: string;
  portrait_url: string | null;
  greeting_audio_url: string | null;
  audio_is_synthetic: boolean;
  faqs: { id: string; question: string; answer: string }[];
  suggested_questions: string[];
  revision: string | null;
};
const greeting =
  "Hey, I’m Dawud Muhammed’s AI portfolio guide. What would you like to know about his projects, experience, or how he could help with your project?";
const assistantName = "Dawud's AI Assistant";
const defaults: Config = {
  enabled: false,
  greeting,
  portrait_url: null,
  greeting_audio_url: "/audio/introduction.wav",
  audio_is_synthetic: true,
  faqs: [],
  suggested_questions: [
    "Which project best shows Dawud’s backend skills?",
    "What did Dawud contribute to Alyah CRM?",
    "Can he improve an existing Laravel application?",
  ],
  revision: null,
};
const approved = (url: string) =>
  Boolean(safeUrl(url)) &&
  /^\/(?:projects|services|blog|about|contact)(?:\/[^/]+)?\/?$/.test(url);
const mediaUrl = (url: string | null | undefined) => safeUrl(url);
export function PortfolioGuide() {
  const { data: profile } = useProfile();
  const [config, setConfig] = useState(defaults);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [retry, setRetry] = useState("");
  const [audioState, setAudioState] = useState("");
  const [sound, setSound] = useState(() => {
    try {
      return localStorage.getItem("guide-sound") === "on";
    } catch {
      return false;
    }
  });
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const played = useRef(false);
  const revision = useRef<string | null>(null);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/assistant", { cache: "no-store" });
      if (!response.ok) throw Error();
      const value = (await response.json()) as Config;
      if (typeof value.enabled !== "boolean") throw Error();
      if (revision.current && value.revision !== revision.current) {
        abort.current?.abort();
        generation.current++;
        setBusy(false);
        setMessages([]);
        setStatus(
          "Portfolio content changed. Ask again for the latest information.",
        );
      }
      revision.current = value.revision;
      setConfig(value);
    } catch {
      setConfig(defaults);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => void refresh(), 30000);
    return () => clearInterval(timer);
  }, [open, refresh]);
  const stopAudio = useCallback(() => {
    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = 0;
    }
    setAudioState("");
  }, []);
  const playAudio = useCallback(async () => {
    const url = mediaUrl(config.greeting_audio_url);
    if (!url) return;
    stopAudio();
    const player = new Audio(url);
    audio.current = player;
    player.onended = () => setAudioState("");
    player.onerror = () =>
      setAudioState("The introduction could not be played.");
    try {
      await player.play();
      setAudioState("Playing introduction");
    } catch {
      setAudioState("Press Play introduction to listen.");
    }
  }, [config.greeting_audio_url, stopAudio]);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      input.current?.focus();
    } else if (dialog.current?.open) {
      dialog.current.close();
      launcher.current?.focus();
      stopAudio();
    }
  }, [open, stopAudio]);
  useEffect(() => {
    if (open && sound && !played.current && config.greeting_audio_url) {
      played.current = true;
      void playAudio();
    }
  }, [open, sound, config.greeting_audio_url, playAudio]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages, busy, status]);
  useEffect(
    () => () => {
      abort.current?.abort();
      audio.current?.pause();
    },
    [],
  );
  const close = () => {
    stopAudio();
    abort.current?.abort();
    setOpen(false);
  };
  const send = async (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setQuestion("");
    setRetry("");
    setStatus("");
    if (!navigator.onLine) {
      setStatus("You’re offline. Reconnect to ask a question.");
      setRetry(value);
      return;
    }
    if (!config.enabled) {
      setStatus(
        "Live answers are currently paused. Browse the approved FAQs below or contact Dawud.",
      );
      setQuestion(value);
      return;
    }
    const history = messages
      .slice(-6)
      .map(({ role, content }) => ({ role, content }));
    setMessages((previous) => [
      ...previous.slice(-11),
      { role: "user", content: value },
    ]);
    setBusy(true);
    const requestGeneration = ++generation.current;
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: value, history }),
        signal: controller.signal,
        credentials: "same-origin",
      });
      const data = await response.json();
      if (requestGeneration !== generation.current) return;
      if (!response.ok)
        throw Error(
          data.message || "The guide couldn’t answer. Please try again.",
        );
      if (revision.current && data.revision !== revision.current) {
        setMessages([]);
        await refresh();
        setStatus("Portfolio content changed. Please ask your question again.");
        return;
      }
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: String(
            data.answer || "Please contact Dawud for more information.",
          ),
          sources: (Array.isArray(data.sources) ? data.sources : []).filter(
            (s: Source) => typeof s.url === "string" && approved(s.url),
          ),
        },
      ]);
    } catch (error) {
      if (requestGeneration !== generation.current) return;
      setStatus(
        error instanceof Error && error.name === "AbortError"
          ? "Answer cancelled."
          : error instanceof Error
            ? error.message
            : "The guide is temporarily unavailable.",
      );
      setRetry(value);
    } finally {
      if (requestGeneration === generation.current) {
        setBusy(false);
        abort.current = null;
      }
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(question);
  };
  const portrait = mediaUrl(
    config.portrait_url || profile?.profile_picture_url,
  );
  return (
    <>
      <button
        ref={launcher}
        className="guide-launcher"
        onClick={() => setOpen(true)}
        aria-label={assistantName}
        aria-haspopup="dialog"
        aria-controls="portfolio-guide-dialog"
        aria-expanded={open}
      >
        <span className="guide-launcher-avatar" aria-hidden="true">
          {portrait ? (
            <img src={portrait} alt="" width="38" height="38" />
          ) : (
            <span className="guide-monogram" aria-hidden="true">
              d.
            </span>
          )}
        </span>
        <span className="guide-launcher-copy">
          <strong className="guide-launcher-title">{assistantName}</strong>
          <span className="guide-launcher-subtitle">
            Projects, experience &amp; ideas
          </span>
        </span>
        <ArrowUpRight
          className="guide-launcher-arrow"
          size={17}
          aria-hidden="true"
        />
      </button>
      <dialog
        ref={dialog}
        id="portfolio-guide-dialog"
        className="guide-dialog"
        aria-labelledby="guide-title"
        onCancel={() => close()}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        <div className="guide-panel">
          <header className="guide-header">
            <div className="guide-header-identity">
              {portrait && (
                <img
                  className="guide-header-portrait"
                  src={portrait}
                  alt=""
                  width={38}
                  height={38}
                />
              )}
              <div>
                <h2 id="guide-title">{assistantName}</h2>
                <p>Let’s find the work that fits your idea.</p>
              </div>
            </div>
            <button
              className="icon-button"
              aria-label="Close guide"
              onClick={close}
            >
              <X size={18} />
            </button>
          </header>
          <div className="guide-messages">
            <p className="guide-greeting">{config.greeting}</p>
            {config.greeting_audio_url && (
              <div className="guide-audio">
                <button
                  onClick={() => {
                    played.current = true;
                    void playAudio();
                  }}
                >
                  Play introduction
                </button>
                <button onClick={stopAudio}>Stop</button>
                <button
                  onClick={() => {
                    const next = !sound;
                    setSound(next);
                    try {
                      localStorage.setItem("guide-sound", next ? "on" : "off");
                    } catch {
                      /* preference remains in memory */
                    }
                    if (!next) stopAudio();
                  }}
                >
                  {sound ? "Mute" : "Enable sound"}
                </button>
                {config.audio_is_synthetic && <span>Synthetic voice</span>}
                <span role="status">{audioState}</span>
              </div>
            )}
            {messages.length === 0 && (
              <div className="guide-suggestions">
                {(config.enabled ? config.suggested_questions : [])
                  .slice(0, 5)
                  .map((text) => (
                    <button key={text} onClick={() => void send(text)}>
                      {text} ↗
                    </button>
                  ))}
                {!config.enabled && (
                  <p className="guide-status">
                    Live answers are paused. You can browse published answers
                    here or{" "}
                    <Link to="/contact" onClick={close}>
                      contact Dawud ↗
                    </Link>
                    .
                  </p>
                )}
                {config.faqs.map((faq) => (
                  <details key={faq.id}>
                    <summary>{faq.question}</summary>
                    <p className="guide-greeting">{faq.answer}</p>
                  </details>
                ))}
              </div>
            )}
            <div aria-live="polite" aria-relevant="additions text">
              {messages.map((message, i) => (
                <article key={i} className={`guide-message ${message.role}`}>
                  <strong>
                    {message.role === "user" ? "You" : assistantName}
                  </strong>
                  {message.content}
                  {message.sources && (
                    <nav aria-label="Answer sources">
                      {message.sources.map((source) => (
                        <Link key={source.id} to={source.url} onClick={close}>
                          {source.title} ↗
                        </Link>
                      ))}
                    </nav>
                  )}
                </article>
              ))}
              {busy && (
                <p className="guide-status" role="status">
                  Reading Dawud’s published work…
                </p>
              )}
              {status && (
                <p className="guide-status" role="status">
                  {status}
                </p>
              )}
            </div>
            <div ref={end} />
          </div>
          <form className="guide-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="guide-question">
              Ask about Dawud’s work
            </label>
            <div className="guide-input">
              <input
                ref={input}
                id="guide-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about my work…"
                maxLength={1200}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={busy || !question.trim()}
                aria-label="Send question"
              >
                <ArrowUp size={19} />
              </button>
            </div>
            <div className="guide-tools">
              {busy && (
                <button type="button" onClick={() => abort.current?.abort()}>
                  Cancel answer
                </button>
              )}
              {retry && !busy && (
                <button type="button" onClick={() => void send(retry)}>
                  Retry question
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  generation.current++;
                  abort.current?.abort();
                  setBusy(false);
                  setMessages([]);
                  setStatus("");
                  setRetry("");
                }}
              >
                Clear conversation
              </button>
              <Link to="/contact" onClick={close}>
                Contact Dawud ↗
              </Link>
            </div>
            <p className="guide-privacy">
              AI can make mistakes. Questions are processed by OpenAI when live
              answers are enabled. This site does not save conversation text.
              Please don’t share sensitive information.
            </p>
          </form>
        </div>
      </dialog>
    </>
  );
}

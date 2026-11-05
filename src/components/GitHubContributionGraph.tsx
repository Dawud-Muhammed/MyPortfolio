import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { ArrowUpRight, Github, RefreshCw } from "lucide-react";
import {
  calendarForYear,
  getCachedContributions,
  GITHUB_CACHE_MS,
  GITHUB_USERNAME,
  loadContributions,
  type ContributionData,
  type ContributionDay,
} from "../lib/github-contributions";

const dayLabel = (day: ContributionDay) =>
  `${day.count.toLocaleString("en")} ${day.count === 1 ? "contribution" : "contributions"} on ${new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}`;

export function GitHubContributionGraph() {
  const [data, setData] = useState<ContributionData | undefined>(
    getCachedContributions,
  );
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(false);
  const [year, setYear] = useState(new Date().getUTCFullYear());
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    day: ContributionDay;
    x: number;
    y: number;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const tooltipId = useId();
  const helpId = useId();
  const today = new Date().toISOString().slice(0, 10);
  const years = useMemo(
    () =>
      Object.keys(data?.total || {})
        .map(Number)
        .sort((a, b) => b - a),
    [data],
  );
  const selectedYear = years.includes(year) ? year : years[0];
  const calendar = useMemo(
    () => (data && selectedYear ? calendarForYear(data, selectedYear) : null),
    [data, selectedYear],
  );
  const knownDays = calendar?.cells.filter(
    (day): day is ContributionDay => !!day && day.date <= today,
  );
  const lastKnownDate = knownDays?.[knownDays.length - 1]?.date;
  const tabDate = knownDays?.some((day) => day.date === activeDate)
    ? activeDate
    : lastKnownDate;

  useEffect(() => {
    let mounted = true;
    let lastFailure = 0;
    const refresh = async (force = false) => {
      const cached = getCachedContributions();
      if (!force && cached && Date.now() - cached.fetchedAt < GITHUB_CACHE_MS)
        return;
      if (!force && Date.now() - lastFailure < 60000) return;
      if (!getCachedContributions()) setLoading(true);
      try {
        const result = await loadContributions(force);
        if (mounted) {
          setData(result);
          setError(false);
        }
      } catch {
        lastFailure = Date.now();
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void refresh(retry > 0);
    const visibleRefresh = () => {
      if (!document.hidden) void refresh();
    };
    const interval = setInterval(visibleRefresh, 60000);
    window.addEventListener("focus", visibleRefresh);
    document.addEventListener("visibilitychange", visibleRefresh);
    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", visibleRefresh);
      document.removeEventListener("visibilitychange", visibleRefresh);
    };
  }, [retry]);

  const tooltipOpen = tooltip !== null;
  useEffect(() => {
    if (!tooltipOpen) return;
    const dismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setTooltip(null);
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [tooltipOpen]);

  const showTooltip = (day: ContributionDay, element: HTMLButtonElement) => {
    const bounds = panel.current?.getBoundingClientRect();
    if (!bounds) return;
    const cell = element.getBoundingClientRect();
    setTooltip({
      day,
      x: Math.max(
        119,
        Math.min(bounds.width - 119, cell.x + cell.width / 2 - bounds.x),
      ),
      y: cell.y - bounds.y - 45,
    });
  };
  const navigate = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Escape") {
      setTooltip(null);
      return;
    }
    if (!calendar) return;
    const delta = (
      { ArrowRight: 7, ArrowLeft: -7, ArrowDown: 1, ArrowUp: -1 } as Record<
        string,
        number
      >
    )[event.key];
    if (delta === undefined && event.key !== "Home" && event.key !== "End")
      return;
    event.preventDefault();
    let next =
      event.key === "Home"
        ? index - (index % 7)
        : event.key === "End"
          ? index + 6 - (index % 7)
          : index + delta!;
    const step = delta && delta < 0 ? -1 : 1;
    while (next >= 0 && next < calendar.cells.length) {
      const day = calendar.cells[next];
      if (day && day.date <= today) {
        const target = buttons.current.get(day.date);
        target?.focus();
        target?.scrollIntoView({ block: "nearest", inline: "nearest" });
        if (target) showTooltip(day, target);
        break;
      }
      next += step;
    }
  };

  return (
    <section
      ref={panel}
      className="hero-art github-activity"
      aria-label="GitHub development activity"
      aria-busy={loading}
    >
      <div className="activity-heading">
        <span>
          <span className="tiny-square" />
          01 — DEVELOPMENT ACTIVITY
        </span>
        <span>GITHUB / PUBLIC CONTRIBUTIONS</span>
      </div>
      <div className="activity-summary">
        <div>
          <p className="activity-identity">
            <Github size={15} aria-hidden="true" />
            {GITHUB_USERNAME}
          </p>
          {data && selectedYear ? (
            <p className="activity-total">
              <strong>
                {data.total[String(selectedYear)].toLocaleString("en")}
              </strong>{" "}
              <span>
                {data.total[String(selectedYear)] === 1
                  ? "contribution"
                  : "contributions"}{" "}
                in {selectedYear}
              </span>
            </p>
          ) : (
            <p className="activity-title">A year of small steps.</p>
          )}
        </div>
        {years.length > 0 && (
          <div className="activity-year">
            <label htmlFor="contribution-year">Contribution year</label>
            <select
              id="contribution-year"
              value={selectedYear}
              onChange={(e) => {
                setYear(Number(e.target.value));
                setActiveDate(null);
                setTooltip(null);
              }}
            >
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      {loading && !data && (
        <div className="activity-state" role="status">
          <div className="activity-skeleton" aria-hidden="true">
            {Array.from({ length: 70 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <p>Loading GitHub contributions…</p>
        </div>
      )}
      {!loading && !data && (
        <div className="activity-state" role="status">
          <p>GitHub activity is unavailable right now.</p>
          <p>Your projects and contact links are ready to explore.</p>
          <button
            className="activity-retry"
            onClick={() => setRetry((value) => value + 1)}
          >
            <RefreshCw size={13} />
            Retry GitHub activity
          </button>
        </div>
      )}
      {data && calendar && (
        <>
          <div
            className="contribution-scroll"
            role="region"
            aria-label="GitHub contribution calendar"
            tabIndex={0}
            aria-describedby={helpId}
            onScroll={() => {
              const focused = document.activeElement;
              const day = calendar.cells.find(
                (day) => day?.date === focused?.getAttribute("data-date"),
              );
              if (day && focused instanceof HTMLButtonElement)
                showTooltip(day, focused);
              else setTooltip(null);
            }}
          >
            <div
              className="contribution-board"
              style={{ "--weeks": calendar.weeks } as CSSProperties}
            >
              <div className="contribution-months" aria-hidden="true">
                {calendar.months.map((month) => (
                  <span key={month.label} style={{ gridColumn: month.column }}>
                    {month.label}
                  </span>
                ))}
              </div>
              <div className="contribution-weekdays" aria-hidden="true">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
              <div
                className="contribution-cells"
                role="group"
                aria-label={`Daily contributions for ${selectedYear}`}
              >
                {calendar.cells.map((day, i) =>
                  day && day.date <= today ? (
                    <button
                      key={day.date}
                      type="button"
                      ref={(node) => {
                        if (node) buttons.current.set(day.date, node);
                        else buttons.current.delete(day.date);
                      }}
                      className="contribution-cell"
                      data-level={day.level}
                      data-date={day.date}
                      aria-label={dayLabel(day)}
                      aria-describedby={
                        tooltip?.day.date === day.date ? tooltipId : undefined
                      }
                      tabIndex={day.date === tabDate ? 0 : -1}
                      onPointerEnter={(e) => showTooltip(day, e.currentTarget)}
                      onPointerLeave={(e) => {
                        if (document.activeElement !== e.currentTarget)
                          setTooltip(null);
                      }}
                      onFocus={(e) => {
                        setActiveDate(day.date);
                        showTooltip(day, e.currentTarget);
                      }}
                      onBlur={() => setTooltip(null)}
                      onClick={(e) => showTooltip(day, e.currentTarget)}
                      onKeyDown={(e) => navigate(e, i)}
                    />
                  ) : (
                    <span
                      key={day?.date || i}
                      className={`contribution-cell ${day ? "future" : "padding"}`}
                      aria-hidden="true"
                    />
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="activity-legend">
            <p id={helpId}>
              <span className="activity-desktop-hint">
                Hover, tap, or use arrow keys.
              </span>
              <span className="activity-touch-hint">
                Swipe through the year. Tap a day for details.
              </span>{" "}
              Future dates are blank.
            </p>
            <span>
              Less{" "}
              <span
                className="contribution-scale"
                aria-label="Contribution intensity, low to high"
              >
                {[0, 1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className="contribution-cell"
                    data-level={level}
                  />
                ))}
              </span>{" "}
              More
            </span>
          </div>
          {data.total[String(selectedYear)] === 0 && (
            <p className="activity-empty" role="status">
              No contributions recorded for {selectedYear}.
            </p>
          )}
        </>
      )}
      {tooltip && (
        <div
          role="tooltip"
          id={tooltipId}
          className="contribution-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {dayLabel(tooltip.day)}
        </div>
      )}
      {error && data && (
        <p className="activity-refresh-error" role="status">
          Couldn’t refresh. Showing the last fetched data.{" "}
          <button onClick={() => setRetry((value) => value + 1)}>
            Retry GitHub activity
          </button>
        </p>
      )}
      <footer className="activity-footer">
        <p>Building, learning, and shipping.</p>
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noreferrer"
        >
          Explore GitHub <ArrowUpRight size={15} />
        </a>
      </footer>
      <p className="activity-cache-note">
        {data
          ? `Fetched ${new Date(data.fetchedAt).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })} UTC · `
          : ""}
        Source cached up to 1 hour. Refreshes periodically.
      </p>
    </section>
  );
}

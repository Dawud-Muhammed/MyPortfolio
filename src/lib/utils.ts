export function formatDate(date: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  });
}

/** Strip import artifacts and a repeated opening title, preserving fenced code. */
export function articleContent(content: string, title = ''): string {
  let inFence = false;
  const cleaned = content.split('\n').map(line => {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    return inFence ? line : line.replace(/\[cite:\s*[\d,\s]+\]/gi, '');
  }).join('\n').trim();
  const lines = cleaned.split('\n');
  const heading = lines[0]?.replace(/^#\s+/, '').replace(/[*_]/g, '').trim();
  if (/^#\s+/.test(lines[0] || '') && heading.toLocaleLowerCase() === title.trim().toLocaleLowerCase()) lines.shift();
  return lines.join('\n').trim();
}

/** Same cleaned article and 200-word/minute estimate on cards, detail and admin. */
export function readingMinutes(content: string, title = ''): number {
  const words = articleContent(content, title).replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/<[^>]*>/g, '').match(/\S+/g)?.length || 0;
  return Math.max(1, Math.ceil(words / 200));
}

/** CMS links may be relative to this site or HTTPS/HTTP; reject executable schemes. */
export function safeUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const text = value.trim();
  if (/^\/(?!\/)/.test(text) && !text.includes('\\')) return text;
  try { const url = new URL(text); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

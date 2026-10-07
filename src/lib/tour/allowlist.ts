export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

export function hostFromUrl(url: string): string | null {
  try {
    return normalizeHost(new URL(url).hostname);
  } catch {
    return null;
  }
}

export function isAllowedEmbedHost(
  host: string,
  allowlist: string[]
): boolean {
  const normalized = normalizeHost(host);
  return allowlist.some((entry) => normalizeHost(entry) === normalized);
}

export function isAllowedEmbedUrl(
  url: string,
  allowlist: string[]
): boolean {
  const host = hostFromUrl(url);
  if (!host) return false;
  return isAllowedEmbedHost(host, allowlist);
}

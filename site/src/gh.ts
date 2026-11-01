/** Build-time GitHub API headers; CI sets GH_BUILD_TOKEN to lift the 60-request unauthenticated hourly limit. */
declare const process: { env: Record<string, string | undefined> };

export function ghHeaders(): Record<string, string> {
  const token = process.env.GH_BUILD_TOKEN || "";
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "noahhyden.com-build",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

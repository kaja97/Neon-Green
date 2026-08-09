/**
 * Shared image-URL helper.
 *
 * Handles three cases:
 *  1. Falsy / empty → returns empty string
 *  2. Already absolute (starts with "http") → pass-through
 *  3. Relative path from the backend → prepend the API host
 */

function getApiBase(): string {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
}

export function getImageUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${getApiBase()}${path}`;
}

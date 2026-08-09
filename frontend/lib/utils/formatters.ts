/**
 * Format currency for display (defaults to LKR).
 * e.g., formatCurrency(180) → "LKR 180.00"
 * e.g., formatCurrency(396000) → "LKR 396,000"
 */
export function formatCurrency(
  amount: number,
  currency: string = "LKR",
  decimals: number = 0
): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${currency} ${formatted}`;
}

/**
 * Format area for display.
 * e.g., formatArea(1.0, "acres") → "1.0 acres"
 */
export function formatArea(value: number, unit: string = "acres"): string {
  return `${value.toFixed(1)} ${unit}`;
}

/**
 * Format weight/volume for display.
 * e.g., formatWeight(45.0, "kg") → "45.0kg"
 */
export function formatWeight(value: number, unit: string = "kg"): string {
  return `${value.toFixed(1)}${unit}`;
}

/**
 * Format price with trend indicator.
 * e.g., formatPriceWithTrend(180, "rising") → "180 LKR/kg ↑"
 */
export function formatPriceWithTrend(
  price: number,
  trend: string,
  changePct?: number
): string {
  const arrow =
    trend === "rising" ? "↑" : trend === "falling" ? "↓" : "→";
  const pctStr = changePct ? ` ${changePct > 0 ? "+" : ""}${changePct}%` : "";
  return `${price} LKR/kg ${arrow}${pctStr}`;
}

/**
 * Format a percentage for display.
 * e.g., formatPercent(50.5) → "50.5%"
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format temperature.
 * e.g., formatTemp(32) → "32°C"
 */
export function formatTemp(value: number): string {
  return `${Math.round(value)}°C`;
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Map the stored farming_method enum value to a human-readable label.
 * The DB stores "inorganic", but users see "Conventional" everywhere.
 * Unknown values fall back to a capitalized version of the input.
 */
export function formatFarmingMethod(method: string | undefined | null): string {
  if (!method) return "Farming";
  const map: Record<string, string> = {
    organic: "Organic",
    inorganic: "Conventional",
    integrated: "Integrated",
  };
  return map[method] ?? method.charAt(0).toUpperCase() + method.slice(1);
}

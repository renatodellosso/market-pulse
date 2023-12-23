export function formatPercentChange(change: number): string {
  const text = (change >= 0 ? "+" : "") + (change * 100).toFixed(2) + "%";

  let color = "black";
  if (change > 0) color = "green";
  else if (change < 0) color = "red";

  return `<span style="color:${color}">${text}</span>`;
}

export function formatPercent(decimal: number): string {
  const text = (decimal * 100).toFixed(2) + "%";

  let color = "black";
  if (decimal > 1) color = "green";
  else if (decimal < 1) color = "red";

  return `<span style="color:${color}">${text}</span>`;
}

export function formatOutlook(outlook: string): string {
  let color = "black";
  if (outlook == "Bullish") color = "green";
  else if (outlook == "Bearish") color = "red";

  return `<span style="color:${color}">${outlook}</span>`;
}

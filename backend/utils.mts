export function formatPercentChange(change: number): string {
  const text = (change >= 0 ? "+" : "") + (change * 100).toFixed(2) + "%";

  let color = "black";
  if (change > 0) color = "green";
  else if (change < 0) color = "red";

  return `<style color="${color}">${text}</style>`;
}

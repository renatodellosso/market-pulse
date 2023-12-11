import yahooFinance from "yahoo-finance2";

export async function dailyChange(symbol: string): Promise<number> {
  const data = await yahooFinance.quoteSummary(symbol);

  return data.price?.regularMarketChangePercent ?? 0;
}

async function changeOverTime(
  symbol: string,
  days: number,
  startWithOpen: boolean = false,
  includeWeekends: boolean = false
): Promise<number> {
  const startDate = new Date();

  if (includeWeekends) startDate.setDate(startDate.getDate() - days);
  else {
    // We start with 1 because we don't want to count today.
    for (let i = 1; i < days; i++) {
      startDate.setDate(startDate.getDate() - 1);
      if (startDate.getDay() == 0) i--;
      if (startDate.getDay() == 6) i--;
    }
  }

  const data = await yahooFinance.chart(symbol, {
    period1: startDate,
  });

  const start = data.quotes[0];
  let end = data.quotes[data.quotes.length - 1];

  if (end.close === null) end = data.quotes[data.quotes.length - 2];

  if (!start || !end) throw new Error("Invalid data.");

  return end.close! / (startWithOpen ? start.open : start.close)! - 1;
}

export async function weeklyChange(symbol: string): Promise<number> {
  return changeOverTime(symbol, 5, true);
}

export async function monthlyChange(symbol: string): Promise<number> {
  return changeOverTime(symbol, 30, false, true);
}

import { CalendarEvent } from "@/lib/types";
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

export async function yearlyChange(symbol: string): Promise<number> {
  return changeOverTime(symbol, 365, false, true);
}

export async function ytdChange(symbol: string): Promise<number> {
  const date = new Date();

  // Take today, subtract Jan 1, then divide by milliseconds in a day.
  const days =
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    24 /
    60 /
    60 /
    1000;

  return changeOverTime(symbol, days, false, true);
}

export async function calendarEvents(
  symbol: string
): Promise<CalendarEvent[] | undefined> {
  let data;
  try {
    data = await yahooFinance.quoteSummary(symbol, {
      modules: ["calendarEvents"],
    });
  } catch (e: any) {
    console.log("Error fetching calendar events: " + e.message);
    return undefined;
  }

  const events: CalendarEvent[] = [];

  const earnings = data.calendarEvents?.earnings;
  if (earnings?.earningsDate) {
    events.push(new CalendarEvent("Earnings", earnings.earningsDate[0]));
  }

  // Ex Dividend Date is the last day to buy a stock to receive the dividend.
  const exDividends = data.calendarEvents?.exDividendDate;
  if (exDividends) {
    events.push(
      new CalendarEvent(
        "Previous Last Purchase Date to Receive Dividends",
        exDividends
      )
    );
  }

  const dividends = data.calendarEvents?.dividendDate;
  if (dividends) {
    events.push(new CalendarEvent("Previous Dividend Date", dividends));
  }

  return events;
}

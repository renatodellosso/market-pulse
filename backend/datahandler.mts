import { ReportData, StockData } from "@/lib/types";
import {
  avgVolume,
  calendarEvents,
  dailyChange,
  dailyVolume,
  monthlyChange,
  monthlyVolume,
  outlook,
  recommendations,
  weeklyChange,
  weeklyVolume,
  yearlyChange,
  ytdChange,
} from "./apihandler.mts";

let stocks: Map<string, StockData>;

export function addSymbolToFetchQueue(symbol: string, data: string[]) {
  console.log(`Adding ${symbol} to fetch queue...`);

  const neededData = data.filter((d) => !d.includes("vs"));

  // Ensure we collect change data if we are comparing to GSPC.
  if (
    data.includes(ReportData.DAILY_VS_GSPC) &&
    !data.includes(ReportData.DAILY_CHANGE)
  )
    neededData.push(ReportData.DAILY_CHANGE);
  if (
    data.includes(ReportData.WEEKLY_VS_GSPC) &&
    !data.includes(ReportData.WEEKLY_CHANGE)
  )
    neededData.push(ReportData.WEEKLY_CHANGE);
  if (
    data.includes(ReportData.MONTHLY_VS_GSPC) &&
    !data.includes(ReportData.MONTHLY_CHANGE)
  )
    neededData.push(ReportData.MONTHLY_CHANGE);
  if (
    data.includes(ReportData.YEARLY_VS_GSPC) &&
    !data.includes(ReportData.YEARLY_CHANGE)
  )
    neededData.push(ReportData.YEARLY_CHANGE);
  if (
    data.includes(ReportData.YTD_VS_GSPC) &&
    !data.includes(ReportData.YTD_CHANGE)
  )
    neededData.push(ReportData.YTD_CHANGE);
  if (data.includes(ReportData.UNUSUAL_VOLUME))
    neededData.push(ReportData.DAILY_VOLUME);

  if (stocks.has(symbol)) {
    const stockData = stocks.get(symbol);

    for (const data of neededData) {
      stockData?.data.add(data);
    }
    for (const data of neededData) {
      stockData?.neededData.add(data);
    }
  } else {
    const stockData = new StockData(
      symbol,
      new Set<string>(data),
      new Set<string>(neededData)
    );

    stocks.set(symbol, stockData);
  }
}

export function clearFetchQueue() {
  stocks = new Map<string, StockData>();
}

export async function processFetchQueue() {
  stocks.set(
    "^GSPC",
    new StockData(
      "^GSPC",
      new Set<string>(),
      new Set<string>([
        ReportData.DAILY_CHANGE,
        ReportData.WEEKLY_CHANGE,
        ReportData.MONTHLY_CHANGE,
        ReportData.YEARLY_CHANGE,
        ReportData.YTD_CHANGE,
      ])
    )
  );

  console.log("Processing fetch queue... Symbols to Fetch: " + stocks.size);

  const promises = Array.from(stocks.keys()).map(fetchStockData);
  await Promise.all(promises);

  console.log("Finished processing fetch queue.");
}

async function fetchStockData(symbol: string) {
  const stock = stocks.get(symbol);

  if (!stock) {
    console.log(`Stock ${symbol} not found in fetch queue.`);
    return;
  }

  console.log(`Fetching ${symbol}... Data: ${stock?.data}`);

  for (const data of stock?.neededData ?? []) {
    console.log(`Fetching ${symbol} ${data}...`);
    switch (data) {
      case ReportData.DAILY_CHANGE:
        stock.dailyChange = await dailyChange(symbol);
        break;
      case ReportData.WEEKLY_CHANGE:
        stock.weeklyChange = await weeklyChange(symbol);
        break;
      case ReportData.MONTHLY_CHANGE:
        stock.monthlyChange = await monthlyChange(symbol);
        break;
      case ReportData.YEARLY_CHANGE:
        stock.yearlyChange = await yearlyChange(symbol);
        break;
      case ReportData.YTD_CHANGE:
        stock.ytdChange = await ytdChange(symbol);
        break;
      case ReportData.EVENTS:
        stock.events = await calendarEvents(symbol);
        break;
      case ReportData.DAILY_VOLUME:
        if (stock.avgVolume === undefined)
          stock.avgVolume = await avgVolume(symbol);
        stock.dailyVolume = await dailyVolume(symbol);
        break;
      case ReportData.WEEKLY_VOLUME:
        if (stock.avgVolume === undefined)
          stock.avgVolume = await avgVolume(symbol);
        stock.weeklyVolume = await weeklyVolume(symbol);
        break;
      case ReportData.MONTHLY_VOLUME:
        if (stock.avgVolume === undefined)
          stock.avgVolume = await avgVolume(symbol);
        stock.monthlyVolume = await monthlyVolume(symbol);
        break;
      case ReportData.RECOMMENDATIONS:
        stock.recommendations = await recommendations(symbol);
        break;
      case ReportData.IMMEDIATE_TERM_OUTLOOK:
        stock.immediateTermOutlook = (await outlook(symbol))[0];
        break;
      case ReportData.SHORT_TERM_OUTLOOK:
        stock.shortTermOutlook = (await outlook(symbol))[1];
        break;
      case ReportData.LONG_TERM_OUTLOOK:
        stock.longTermOutlook = (await outlook(symbol))[2];
        break;
    }
  }

  console.log(`Finished fetching ${symbol}.`);
}

export function getStockData(symbol: string): StockData | undefined {
  return stocks.get(symbol);
}

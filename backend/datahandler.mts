import { ReportData, StockData } from "@/lib/types";
import { dailyChange, monthlyChange, weeklyChange } from "./apihandler.mts";

let stocks: Map<string, StockData>;

export function addSymbolToFetchQueue(symbol: string, data: string[]) {
  console.log(`Adding ${symbol} to fetch queue...`);

  if (stocks.has(symbol)) {
    const stockData = stocks.get(symbol);

    stockData?.data.push(...data);
  } else {
    const stockData = new StockData(symbol);

    stockData.data.push(...data);

    stocks.set(symbol, stockData);
  }
}

export function clearFetchQueue() {
  stocks = new Map<string, StockData>();
}

export async function processFetchQueue() {
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

  for (const data of stock?.data ?? []) {
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
    }
  }

  console.log(`Finished fetching ${symbol}.`);
}

export function getStockData(symbol: string): StockData | undefined {
  return stocks.get(symbol);
}

import { getReportsByFrequency } from "@/lib/db/reports";
import { loadEnv } from "./envloader.mts";
import { Email, ReportFrequency } from "@/lib/types";
import { getWatchlist } from "@/lib/db/watchlists";
import {
  addSymbolToFetchQueue,
  clearFetchQueue,
  processFetchQueue,
} from "./datahandler.mts";
import { sendEmails } from "./emailhandler.mjs";
import { exit } from "process";

console.log("Starting backend...");

loadEnv();

async function sendUpdates(frequencies: string[]) {
  console.log("Sending updates...");

  clearFetchQueue();

  console.log("Finding reports...");
  const reports = [];
  for (const frequency of frequencies) {
    const found = await getReportsByFrequency(frequency);
    for (const report of found) {
      reports.push(report);
    }
  }

  const emails: Email[] = [];
  reports.forEach(async (report) => {
    console.log("Found reports.");

    console.log(`Processing report ${report.name}...`);
    const watchlist = await getWatchlist(report.watchlist._id.toString());

    watchlist?.symbols.forEach(async (symbol) => {
      addSymbolToFetchQueue(symbol, report.data);
    });

    emails.push({
      recipient: report.ownerEmail,
      name: report.name,
      symbols: watchlist?.symbols ?? [],
      data: report.data,
    });

    console.log(`Finished processing report ${report.name}.`);
  });

  console.log("Finished processing reports.");

  processFetchQueue();
  sendEmails(emails).then(() => {
    console.log("Finished sending emails.");
  });
}

async function main() {
  while (true) {
    try {
      let date = new Date();

      // Wait until 6:30 PM
      while (date.getHours() < 18 || date.getMinutes() < 30) {
        date = new Date();
        await new Promise((resolve) => setTimeout(resolve, 15 * 60 * 1000));
      }

      console.log("Done waiting.");

      const frequencies: string[] = [];
      if (date.getDay() > 0 && date.getDay() < 6)
        frequencies.push(ReportFrequency.DAILY);
      if (date.getDay() === 6) frequencies.push(ReportFrequency.WEEKLY);

      // Check if tomorrow is a new month
      const month = date.getMonth();
      date.setDate(date.getDate() + 1);
      if (date.getMonth() !== month) frequencies.push(ReportFrequency.MONTHLY);

      await sendUpdates(frequencies);
    } catch (e) {
      console.log(e);
    }
  }
}

main();

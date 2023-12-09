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

clearFetchQueue();

console.log("Finding reports...");
const reports = getReportsByFrequency(ReportFrequency.DAILY);
const emails: Email[] = [];
reports
  .then(async (reports) => {
    console.log("Found reports.");

    for (const report of reports) {
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
    }

    console.log("Finished processing reports.");
  })
  .then(processFetchQueue)
  .then(() => sendEmails(emails))
  .then(() => exit(0));

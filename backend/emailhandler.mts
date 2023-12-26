import { Email, ReportData } from "@/lib/types";
import { getStockData } from "./datahandler.mts";
import { Transporter, createTransport } from "nodemailer";
import { formatOutlook, formatPercent, formatPercentChange } from "./utils.mts";

let transporter: Transporter = null as any;

export async function sendEmails(emails: Email[]) {
  console.log("Sending emails...");

  transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    logger: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const promises = emails.map(sendEmail);
  await Promise.all(promises);

  console.log("Finished sending emails.");
}

async function sendEmail(email: Email) {
  console.log(`Sending email to ${email.recipient}...`);

  const stocks = [];
  for (const symbol of email.symbols) {
    const stock = getStockData(symbol);
    // console.log(stock);
    if (stock) {
      stocks.push(stock);
    }
  }

  // Remove duplicate data
  const uniqueData = [...new Set(email.data)];
  email.data = uniqueData;

  let text = `<h3>${email.name}</h3>`;

  let gspc = undefined;
  if (
    email.data.includes(ReportData.DAILY_VS_GSPC) ||
    email.data.includes(ReportData.WEEKLY_VS_GSPC) ||
    email.data.includes(ReportData.MONTHLY_VS_GSPC)
  ) {
    gspc = getStockData("^GSPC");
  }

  for (const stock of stocks) {
    const change =
      stock.dailyChange ?? stock.weeklyChange ?? stock.monthlyChange ?? 0;

    let color = "black";
    if (change > 0) color = "green";
    else if (change < 0) color = "red";

    text += `<a href="https://finance.yahoo.com/quote/${
      stock.symbol
    }" style="color:${color}">${stock.symbol.toUpperCase()}</a>`;

    if (email.data.includes(ReportData.DAILY_CHANGE))
      text += ` - ${formatPercentChange(stock.dailyChange!)}`;

    text += "<ul>";
    for (const data of email.data) {
      // Check conditions for skipping data.
      if (data == ReportData.DAILY_CHANGE) continue;
      if (data == ReportData.EVENTS && !stock.events) continue;
      if (data.includes("Volume") && stock.avgVolume == 0) continue;
      if (
        data == ReportData.UNUSUAL_VOLUME &&
        Math.abs(1 - stock.dailyVolume! / stock.avgVolume!) < 0.1
      )
        continue;
      if (
        data == ReportData.IMMEDIATE_TERM_OUTLOOK &&
        !stock.immediateTermOutlook
      )
        continue;
      if (data == ReportData.SHORT_TERM_OUTLOOK && !stock.shortTermOutlook)
        continue;
      if (data == ReportData.LONG_TERM_OUTLOOK && !stock.longTermOutlook)
        continue;

      text += "<li>";

      let percent;

      switch (data) {
        case ReportData.WEEKLY_CHANGE:
          text += `5D Change: ${formatPercentChange(stock.weeklyChange!)}`;
          break;
        case ReportData.MONTHLY_CHANGE:
          text += `1M Change: ${formatPercentChange(stock.monthlyChange!)}`;
          break;
        case ReportData.YEARLY_CHANGE:
          text += `1Y Change: ${formatPercentChange(stock.yearlyChange!)}`;
          break;
        case ReportData.YTD_CHANGE:
          text += `YTD Change: ${formatPercentChange(stock.ytdChange!)}`;
          break;
        case ReportData.EVENTS:
          const events = stock.events;

          text += "Events:<ul>";
          for (const event of events!) {
            if (event.name.includes("Dividend")) {
              text += `<li>${
                event.name
              }: ${event.date.toLocaleDateString()}</li>`;
              continue;
            }

            const timeDiff = event.date.getTime() - new Date().getTime();
            const daysDiff = timeDiff / (1000 * 3600 * 24);
            text += `<li>${event.name} in: ${Math.round(daysDiff)} days.</li>`;
          }
          text += "</ul>";

          break;
        case ReportData.DAILY_VS_GSPC:
          text += `1D vs GSPC: ${formatPercentChange(
            stock.dailyChange! - gspc!.dailyChange!
          )}`;
          break;
        case ReportData.WEEKLY_VS_GSPC:
          text += `5D vs GSPC: ${formatPercentChange(
            stock.weeklyChange! - gspc!.weeklyChange!
          )}`;
          break;
        case ReportData.MONTHLY_VS_GSPC:
          text += `1M vs GSPC: ${formatPercentChange(
            stock.monthlyChange! - gspc!.monthlyChange!
          )}`;
          break;
        case ReportData.YEARLY_VS_GSPC:
          text += `1Y vs GSPC: ${formatPercentChange(
            stock.yearlyChange! - gspc!.yearlyChange!
          )}`;
          break;
        case ReportData.YTD_VS_GSPC:
          text += `YTD vs GSPC: ${formatPercentChange(
            stock.ytdChange! - gspc!.ytdChange!
          )}`;
          break;
        case ReportData.DAILY_VOLUME:
          percent = stock.dailyVolume! / stock.avgVolume!;
          text += `1D Volume: ${stock.dailyVolume} (${formatPercent(
            percent
          )} of avg)`;
          break;
        case ReportData.WEEKLY_VOLUME:
          percent = stock.weeklyVolume! / stock.avgVolume!;
          text += `5D Volume: ${stock.weeklyVolume} (${formatPercent(
            percent
          )} of avg)`;
          break;
        case ReportData.MONTHLY_VOLUME:
          percent = stock.monthlyVolume! / stock.avgVolume!;
          text += `1M Volume: ${stock.monthlyVolume} (${formatPercent(
            percent
          )} of avg)`;
          break;
        case ReportData.UNUSUAL_VOLUME:
          percent = stock.dailyVolume! / stock.avgVolume!;
          text += `Unusual Volume: ${stock.dailyVolume} (${formatPercent(
            percent
          )} of avg)`;
          break;
        case ReportData.RECOMMENDATIONS:
          const recommendations = stock.recommendations;

          text += "Recommendations:<ul>";
          for (const recommendation of recommendations!) {
            text += `<li>${recommendation}</li>`;
          }
          text += "</ul>";

          break;
        case ReportData.IMMEDIATE_TERM_OUTLOOK:
          text += `Immediate Term Outlook: ${formatOutlook(
            stock.immediateTermOutlook!
          )}`;
          break;
        case ReportData.SHORT_TERM_OUTLOOK:
          text += `Short Term Outlook: ${formatOutlook(
            stock.shortTermOutlook!
          )}`;
          break;
        case ReportData.LONG_TERM_OUTLOOK:
          text += `Long Term Outlook: ${formatOutlook(stock.longTermOutlook!)}`;
          break;
      }

      text += "</li>";
    }

    text += "</ul>";
  }
  text += "</ul>";

  text +=
    "<br><br>This does not constitute financial advice. Always do your own research before investing and " +
    "double check any data before using it to make decisions.";

  transporter
    .sendMail({
      from: `"Market Pulse" <${process.env.EMAIL_USERNAME}>`,
      to: email.recipient,
      subject: `${email.name} - Market Pulse`,
      html: text,
    })
    .then(() => console.log(`Email sent to ${email.recipient}.`));
}

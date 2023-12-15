import { Email, ReportData } from "@/lib/types";
import { getStockData } from "./datahandler.mts";
import { Transporter, createTransport } from "nodemailer";
import { formatPercentChange } from "./utils.mts";

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

  let text = `<h3>${email.name}</h3>`;

  let gspc = undefined;
  if (
    email.data.includes(ReportData.DAILY_VS_GSPC) ||
    email.data.includes(ReportData.WEEKLY_VS_GSPC) ||
    email.data.includes(ReportData.MONTHLY_VS_GSPC)
  ) {
    gspc = getStockData("^GSPC");
  }

  console.log(gspc);

  for (const stock of stocks) {
    console.log(stock);
    const change =
      stock.dailyChange ?? stock.weeklyChange ?? stock.monthlyChange ?? 0;

    let color = "black";
    if (change > 0) color = "green";
    else if (change < 0) color = "red";

    text += `<a href="https://finance.yahoo.com/quote/${stock.symbol}" style="color:${color}">${stock.symbol}</a>`;

    if (email.data.includes(ReportData.DAILY_CHANGE))
      text += ` - ${formatPercentChange(stock.dailyChange!)}`;

    text += "<ul>";
    for (const data of email.data) {
      if (data == ReportData.DAILY_CHANGE) continue;

      if (data == ReportData.EVENTS && !stock.events) continue;
      text += "<li>";

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
      }

      text += "</li>";
    }

    text += "</ul>";
  }
  text += "</ul>";

  console.log(text);

  await transporter.sendMail({
    from: `"Market Pulse" <${process.env.EMAIL_USERNAME}>`,
    to: email.recipient,
    subject: `${email.name} - Market Pulse`,
    html: text,
  });

  console.log(`Email sent to ${email.recipient}.`);
}

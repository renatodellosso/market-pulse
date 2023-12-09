import { Email } from "@/lib/types";
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
    if (stock) {
      stocks.push(stock);
    }
  }

  let text = `<b>${email.name}</b><br>`;

  for (const stock of stocks) {
    text += `${stock.symbol}`;
    for (const data of email.data) {
      switch (data) {
        case "1D % Change":
          text += ` - ${formatPercentChange(stock.dailyChange!)}`;
          break;
        case "5D % Change":
          text += `<br> - 5D Change: ${formatPercentChange(stock.weeklyChange!)}`;
          break;
      }
    }
  }

  await transporter.sendMail({
    from: `"Market Pulse" <${process.env.EMAIL_USERNAME}>`,
    to: email.recipient,
    subject: `${email.name} - Market Pulse`,
    html: text,
  });

  console.log(`Email sent to ${email.recipient}.`);
}

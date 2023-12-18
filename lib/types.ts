import { ObjectId } from "mongodb";
import { type DefaultUser, type DefaultSession } from "next-auth";
import { exit } from "process";

export interface NamedId {
  name: string;
  _id: ObjectId | string;
}

export interface Watchlist {
  _id: ObjectId | string;
  ownerEmail: string;
  name: string;
  symbols: string[];
}

export class ReportFrequency {
  static readonly DAILY = "Daily";
  static readonly WEEKLY = "Weekly";
  static readonly MONTHLY = "Monthly";
  static readonly frequencies = [
    ReportFrequency.DAILY,
    ReportFrequency.WEEKLY,
    ReportFrequency.MONTHLY,
  ];
}

export class ReportData {
  static readonly DAILY_CHANGE = "1D % Change";
  static readonly WEEKLY_CHANGE = "5D % Change";
  static readonly MONTHLY_CHANGE = "1M % Change";
  static readonly YEARLY_CHANGE = "1Y % Change";
  static readonly YTD_CHANGE = "YTD % Change";
  static readonly EVENTS = "Events";
  static readonly DAILY_VS_GSPC = "1D vs S&P 500";
  static readonly WEEKLY_VS_GSPC = "5D vs S&P 500";
  static readonly MONTHLY_VS_GSPC = "1M vs S&P 500";
  static readonly YEARLY_VS_GSPC = "1Y vs S&P 500";
  static readonly YTD_VS_GSPC = "YTD vs S&P 500";
  static readonly DAILY_VOLUME = "1D Volume";
  static readonly WEEKLY_VOLUME = "5D Avg Volume";
  static readonly MONTHLY_VOLUME = "1M Avg Volume";
  static readonly UNUSUAL_VOLUME = "Unusual Volume";
  static readonly RECOMMENDATIONS = "Recommendations";
  static readonly IMMEDIATE_TERM_OUTLOOK = "Immediate Term Outlook";
  static readonly SHORT_TERM_OUTLOOK = "Short Term Outlook";
  static readonly LONG_TERM_OUTLOOK = "Long Term Outlook";

  static readonly data = [
    ReportData.DAILY_CHANGE,
    ReportData.WEEKLY_CHANGE,
    ReportData.MONTHLY_CHANGE,
    ReportData.YEARLY_CHANGE,
    ReportData.YTD_CHANGE,
    ReportData.EVENTS,
    ReportData.DAILY_VS_GSPC,
    ReportData.WEEKLY_VS_GSPC,
    ReportData.MONTHLY_VS_GSPC,
    ReportData.YEARLY_VS_GSPC,
    ReportData.YTD_VS_GSPC,
    ReportData.DAILY_VOLUME,
    ReportData.WEEKLY_VOLUME,
    ReportData.MONTHLY_VOLUME,
    ReportData.UNUSUAL_VOLUME,
    ReportData.RECOMMENDATIONS,
    ReportData.IMMEDIATE_TERM_OUTLOOK,
    ReportData.SHORT_TERM_OUTLOOK,
    ReportData.LONG_TERM_OUTLOOK,
  ];
}

export interface Report {
  _id: ObjectId | string;
  ownerEmail: string;
  name: string;
  watchlist: NamedId;
  frequency: string;
  data: string[];
}

export class StockData {
  symbol: string;

  data: string[] = [];
  neededData: string[] = []; // Data that we need to fetch, including data that was not explicitly requested

  dailyChange: number | undefined;
  weeklyChange: number | undefined;
  monthlyChange: number | undefined;
  yearlyChange: number | undefined;
  ytdChange: number | undefined;

  events: CalendarEvent[] | undefined;

  dailyVolume: number | undefined;
  weeklyVolume: number | undefined;
  monthlyVolume: number | undefined;
  avgVolume: number | undefined;

  recommendations: string[] | undefined;

  immediateTermOutlook: string | undefined;
  shortTermOutlook: string | undefined;
  longTermOutlook: string | undefined;

  constructor(symbol: string, data: string[] = [], neededData: string[] = []) {
    this.symbol = symbol;
    this.data = data;
    this.neededData = neededData;
  }
}

export class CalendarEvent {
  name: string;
  date: Date;

  constructor(name: string, date: Date) {
    this.name = name;
    this.date = date;
  }
}

export interface Email {
  recipient: string;
  name: string;
  symbols: string[];
  data: string[];
}

declare module "next-auth" {
  interface User extends DefaultUser {
    watchlists: NamedId[];
    reports: NamedId[];
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

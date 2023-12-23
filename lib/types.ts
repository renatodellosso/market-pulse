import { ObjectId } from "mongodb";
import { type DefaultUser, type DefaultSession } from "next-auth";

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

  static readonly data = [
    ReportData.DAILY_CHANGE,
    ReportData.WEEKLY_CHANGE,
    ReportData.MONTHLY_CHANGE,
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

  dailyChange: number | undefined;
  weeklyChange: number | undefined;
  monthlyChange: number | undefined;

  constructor(symbol: string) {
    this.symbol = symbol;
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
    _id: ObjectId | string;
    watchlists: NamedId[];
    reports: NamedId[];
    friends: NamedId[];
    incomingFriendRequests: NamedId[];
    outgoingFriendRequests: NamedId[];
  }

  interface Session extends DefaultSession {
    user: User;
  }
}

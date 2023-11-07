import { ObjectId } from "mongodb";
import { type DefaultUser, type DefaultSession } from "next-auth";

export interface NamedId {
    name: string,
    _id: ObjectId | string
}

export interface Watchlist {
    _id: ObjectId | string,
    ownerEmail: string,
    name: string,
    symbols: string[]
}

export enum ReportFrequency {
    Daily, Weekly, Monthly
}

export interface Report {
    _id: ObjectId | string,
    ownerEmail: string,
    name: string,
    watchlist: ObjectId | string,
    frequency: ReportFrequency
}

declare module "next-auth" {
    interface User extends DefaultUser {
        watchlists: NamedId[],
        reports: NamedId[]   
    }

    interface Session extends DefaultSession {
        user: User
    }
}
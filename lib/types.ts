import { ObjectId } from "mongodb";
import { type DefaultUser, type DefaultSession } from "next-auth";

export interface NamedId {
    name: string,
    _id: ObjectId | string
}

export interface Watchlist {
    _id: ObjectId,
    ownerEmail: string,
    name: string,
    symbols: string[]
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
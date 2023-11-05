import { Collection, Db } from "mongodb";
import clientPromise from "../mongodb";
import { User } from "next-auth";
import { Watchlist } from "../types";

async function getDb(): Promise<Db> {
    return (await clientPromise).db();
}

export async function getUsers(): Promise<Collection<User>> {
    return (await getDb()).collection("users");
}

export async function getWatchlists(): Promise<Collection<Watchlist>> {
    return (await getDb()).collection("watchlists");
}
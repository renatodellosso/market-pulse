import { ObjectId } from "mongodb";
import { getWatchlists } from "./db";
import { Watchlist } from '../types';

export async function createNewWatchlist(ownerEmail: string): Promise<ObjectId | null> {
    const watchlists = await getWatchlists();

    const inserted = await watchlists.insertOne({
        _id: new ObjectId(),
        ownerEmail: ownerEmail,
        name: "New Watchlist",
        symbols: []
    });

    return inserted.insertedId;
}

export async function getWatchlist(id: string): Promise<Watchlist | null> {
    const watchlists = await getWatchlists();

    return watchlists.findOne({ _id: new ObjectId(id) });
}
import { ObjectId } from "mongodb";
import { getWatchlists } from "./db";
import { Watchlist } from '../types';

export async function createNewWatchlist(ownerEmail: string): Promise<ObjectId | string | null> {
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

export async function updateName(id: ObjectId, name: string) {
    const watchlists = await getWatchlists();

    await watchlists.updateOne({ _id: id }, { $set: { name: name } });
}

export async function updateSymbols(id: ObjectId, symbols: string[]) {
    const watchlists = await getWatchlists();

    await watchlists.updateOne({ _id: id }, { $set: { symbols: symbols } });
}
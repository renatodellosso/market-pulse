import { User } from "next-auth";
import { getUsers } from "./db";
import { ObjectId, WithId } from "mongodb";
import { createNewWatchlist } from "./watchlists";
import { createNewReport } from "./reports";
import { NamedId } from "../types";

export async function getUser(id: string): Promise<WithId<User> | null> {
    let users = await getUsers();

    return users.findOne({ _id: ObjectId.createFromHexString(id) });
}

export async function getUserByEmail(email: string): Promise<WithId<User> | null> {
    let users = await getUsers();

    return users.findOne({ email: email });
}

export async function initUser(user: User) {
    let users = await getUsers();

    users.updateOne({ _id: ObjectId.createFromHexString(user.id)}, {
        $set: {
            reports: [],
            watchlists: []
        }
    });
}

export async function newWatchlist(userEmail: string): Promise<ObjectId | string | null> {
    let users = await getUsers();

    const newId = await createNewWatchlist(userEmail);

    if(!newId) return null;

    const result = await users.updateOne({ email: userEmail }, {
        $push: {
            watchlists: {
                $each: [{
                    name: "New Watchlist",
                    _id: newId!
                }],
                $position: 0
            }
        }
    });

    return newId;
}

export async function updateWatchlistName(userEmail: string, watchlistId: ObjectId, name: string) {
    let users = await getUsers();

    // Not entirely sure what this syntax is, but what I believe is happening is that it's finding the element with the matching ID,
    // and then using its index to update that element.
    await users.updateOne({ email: userEmail, "watchlists._id": watchlistId }, {
        $set: {
            "watchlists.$.name": name
        }
    });
}

export async function removeWatchlist(userEmail: string, watchlistId: ObjectId) {
    let users = await getUsers();

    await users.updateOne({ email: userEmail }, {
        $pull: {
            watchlists: {
                _id: watchlistId
            }
        }
    });
}

export async function newReport(userEmail: string, watchlistId: NamedId): Promise<ObjectId | string | null> {
    let users = await getUsers();

    const newId = await createNewReport(userEmail, watchlistId);

    if(!newId) return null;

    const result = await users.updateOne({ email: userEmail }, {
        $push: {
            reports: {
                $each: [{
                    name: "New Report",
                    _id: newId!
                }],
                $position: 0
            }
        }
    });

    return newId;
}

export async function updateReportName(userEmail: string, reportId: ObjectId, name: string) {
    let users = await getUsers();

    // Not entirely sure what this syntax is, but what I believe is happening is that it's finding the element with the matching ID,
    // and then using its index to update that element.
    await users.updateOne({ email: userEmail, "reports._id": reportId }, {
        $set: {
            "reports.$.name": name
        }
    });
}

export async function removeReport(userEmail: string, reportId: ObjectId) {
    let users = await getUsers();

    await users.updateOne({ email: userEmail }, {
        $pull: {
            reports: {
                _id: reportId
            }
        }
    });
}
import { User } from "next-auth";
import { getUsers } from "./db";
import { ObjectId, WithId } from "mongodb";

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

export async function newWatchlist(userId: string): Promise<ObjectId | null> {
    let users = await getUsers();

    let result = await users.updateOne({ _id: ObjectId.createFromHexString(userId) }, {
        $push: {
            watchlists: {
                $each: [{
                    name: "New Watchlist",
                    _id: new ObjectId()
                }],
                $position: 0
            }
        }
    });

    return result.modifiedCount > 0 ? result.upsertedId : null;
}
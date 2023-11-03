import { User } from "next-auth";
import { getUsers } from "./db";
import { ObjectId, WithId } from "mongodb";

export async function getUser(id: string): Promise<WithId<User> | null> {
    let users = await getUsers();

    console.log(id);
    return users.findOne({ _id: ObjectId.createFromHexString(id) });
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
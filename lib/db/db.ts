import { Collection, Db } from "mongodb";
import clientPromise from "../mongodb";
import { User } from "next-auth";

async function getDb(): Promise<Db> {
    return (await clientPromise).db();
}

export async function getUsers(): Promise<Collection<User>> {
    return (await getDb()).collection("users");
}
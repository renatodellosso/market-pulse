import { ObjectId } from "mongodb";

interface NamedId {
    name: string,
    _id: ObjectId
}

declare module "next-auth/react" {
    interface User {
        _id: ObjectId,
        name: string,
        email: string,
        image: string,
        watchLists: NamedId[],
        reports: NamedId[],
    }
}
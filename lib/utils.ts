import { User } from "next-auth";
import { NamedId } from "./types";

export function stringifyNamedIdArray(arr: NamedId[] | undefined): NamedId[] {
  return (
    arr?.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
    })) ?? []
  );
}

export function stringifyUser(user: any): User {
  return {
    _id: user._id.toString(),
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    watchlists: stringifyNamedIdArray(user.watchlists),
    reports: stringifyNamedIdArray(user.reports),
    friends: stringifyNamedIdArray(user.friends),
    incomingFriendRequests: stringifyNamedIdArray(user.incomingFriendRequests),
    outgoingFriendRequests: stringifyNamedIdArray(user.outgoingFriendRequests),
  };
}

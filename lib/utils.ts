import { User } from "next-auth";
import { NamedId, UserId } from "./types";

export function stringifyNamedIdArray(arr: NamedId[] | undefined): NamedId[] {
  return (
    arr?.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
    })) ?? []
  );
}

export function stringifyUserIdArray(arr: UserId[] | undefined): UserId[] {
  return (
    arr?.map((item) => ({
      _id: item._id.toString(),
      name: item.name,
      image:
        item.image ??
        "https://cdn.britannica.com/73/103073-050-EB4992D4/Richard-M-Nixon-1969.jpg",
    })) ?? []
  );
}

export function stringifyUser(user: any): User {
  return {
    _id: user._id.toString(),
    id: user._id.toString(),
    image: user.image,
    name: user.name,
    email: user.email,
    watchlists: stringifyNamedIdArray(user.watchlists),
    reports: stringifyNamedIdArray(user.reports),
    friends: stringifyUserIdArray(user.friends),
    incomingFriendRequests: stringifyUserIdArray(user.incomingFriendRequests),
    outgoingFriendRequests: stringifyUserIdArray(user.outgoingFriendRequests),
  };
}

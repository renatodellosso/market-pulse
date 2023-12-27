"use client";

import { friends } from "@/lib/friendutils";
import { NamedId } from "@/lib/types";
import { User } from "next-auth";
import Link from "next/link";
import { useState } from "react";

export default function ClientPage(props: {
  user: User;
  self: User | undefined;
}) {
  const { user, self } = props;

  let initialRelationship = "none";
  if (self) {
    if (self?._id.toString() === user._id.toString())
      initialRelationship = "self";
    else if (
      self?.friends.find((f) => f._id.toString() === self?._id.toString())
    )
      initialRelationship = "friend";
    else if (
      self?.outgoingFriendRequests.find(
        (f) => f._id.toString() === self?._id.toString()
      )
    )
      initialRelationship = "outgoing";
    else if (
      self?.incomingFriendRequests.find(
        (f) => f._id.toString() === self?._id.toString()
      )
    )
      initialRelationship = "incoming";
  }

  const [relationship, setRelationship] = useState(initialRelationship);

  async function sendFriendRequest(e: any) {
    const res = await friends.sendFriendRequest(e);
    if (res) setRelationship("outgoing");
  }

  async function removeFriend(e: any) {
    const res = await friends.removeFriend(e, user?._id.toString());
    if (res) setRelationship("none");
  }

  async function declineFriendRequest(e: any) {
    const res = await friends.declineFriendRequest(e, user?._id.toString());
    if (res) setRelationship("none");
  }

  async function acceptFriendRequest(e: any) {
    const res = await friends.acceptFriendRequest(e, user?._id.toString());
    if (res) setRelationship("friend");
  }

  let relationshipElement = <></>;
  if (self) {
    switch (relationship) {
      case "self":
        relationshipElement = <div className="pb-4">You</div>;
        break;
      case "friend":
        relationshipElement = (
          <div className="pb-4">
            Friends -{" "}
            <button className="btn btn-error" onClick={removeFriend}>
              Remove
            </button>
          </div>
        );
        break;
      case "outgoing":
        relationshipElement = (
          <div className="pb-4">
            Friend request sent -{" "}
            <button className="btn btn-error" onClick={declineFriendRequest}>
              Cancel
            </button>
          </div>
        );
        break;
      case "incoming":
        relationshipElement = (
          <div className="pb-4">
            Friend request received -{" "}
            <button className="btn btn-success" onClick={acceptFriendRequest}>
              Accept
            </button>
            <button className="btn btn-error" onClick={declineFriendRequest}>
              Decline
            </button>
          </div>
        );
        break;
      default:
        relationshipElement = (
          <div className="pb-4">
            Not friends -{" "}
            <button className="btn btn-primary" onClick={sendFriendRequest}>
              Send Friend Request
            </button>
          </div>
        );
    }
  }

  function getFriendListItem(friend: NamedId) {
    let relationship = "";

    if (self) {
      if (self?._id.toString() === friend._id.toString()) relationship = "You";
      else if (
        self?.friends.find((f) => f._id.toString() === friend._id.toString())
      )
        relationship = "Friends with You";
      else if (
        self?.outgoingFriendRequests.find(
          (f) => f._id.toString() === friend._id.toString()
        )
      )
        relationship = "You've Sent a Friend Request";
      else if (
        self?.incomingFriendRequests.find(
          (f) => f._id.toString() === friend._id.toString()
        )
      )
        relationship = "Sent You a Friend Request";
      else relationship = "Not Friends";
    }

    return (
      <li key={friend._id.toString()}>
        <Link className="link" href={`/profile/${friend._id}`}>
          {friend.name} ({relationship})
        </Link>
      </li>
    );
  }

  return (
    <div className=" w-96">
      <h1 className="text-2xl text-primary">{user.name}</h1>
      {relationshipElement}
      <div className="pb-4">
        <h2 className="text-xl text-secondary">Watchlists</h2>
        <ul>
          {user.watchlists.map((watchlist) => (
            <li key={watchlist._id.toString()}>
              <Link className="link" href={`/watchlist/${watchlist._id}`}>
                {watchlist.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-4">
        <h2 className="text-xl text-secondary">Reports</h2>
        <ul>
          {user.reports.map((report) => (
            <li key={report._id.toString()}>
              <Link className="link" href={`/report/${report._id}`}>
                {report.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-4">
        <h2 className="text-xl text-secondary">Friends</h2>
        <ul>{user.friends.map(getFriendListItem)}</ul>
      </div>
    </div>
  );
}

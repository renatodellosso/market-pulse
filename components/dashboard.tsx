"use client";

import { User } from "next-auth";
import Link from "next/link";
import toast from "react-hot-toast";
import { NamedId, UserId } from "../lib/types";
import { useState } from "react";
import { friends } from "@/lib/friendutils";
import Avatar from "./avatar";

export default function Dashboard(props: { user: User }) {
  const { watchlists, reports } = props.user;

  const [friendList, setFriendList] = useState<UserId[]>(props.user.friends);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<
    UserId[]
  >(props.user.incomingFriendRequests);
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<
    UserId[]
  >(props.user.outgoingFriendRequests);

  async function newWatchlist() {
    console.log("Creating new watchlist...");
    const req = await fetch("/api/watchlist/new");

    const res = await req.json();
    window.location.href = `/watchlist/${res.id}`;
  }

  async function newReport() {
    console.log("Creating new report...");
    const req = await fetch("/api/report/new");

    const res = await req.json();
    window.location.href = `/report/${res.id}`;
  }

  async function sendFriendRequest(e: any) {
    const user = await friends.sendFriendRequest(e);
    if (user) setOutgoingFriendRequests([...outgoingFriendRequests, user]);
  }

  async function declineFriendRequest(e: any, id: string) {
    const user = await friends.declineFriendRequest(e, id);
    if (user) {
      setIncomingFriendRequests(
        incomingFriendRequests.filter((u) => u._id !== user._id)
      );
      setOutgoingFriendRequests(
        outgoingFriendRequests.filter((u) => u._id !== user._id)
      );
    }
  }

  async function acceptFriendRequest(e: any, id: string) {
    const user = await friends.acceptFriendRequest(e, id);
    if (user) {
      setIncomingFriendRequests(
        incomingFriendRequests.filter((u) => u._id !== user._id)
      );
      setFriendList([...friendList, user]);
    }
  }

  async function removeFriend(e: any, id: string) {
    const user = await friends.removeFriend(e, id);
    if (user) {
      setFriendList(friendList.filter((u) => u._id !== user._id));
    }
  }

  function userElement(user: UserId) {
    return (
      <div className="flex flex-row">
        <Avatar src={user.image} alt={`${user.name}'s Profile Picture`} />
        <Link
          className="link text-center"
          href={`/profile/${user._id.toString()}`}
        >
          {user.name}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-fit flex-1 flex items-center justify-center flex-row">
      <div className="w-[50%] flex flex-col items-center space-y-2">
        <h1 className="text-xl text-primary">Watchlists</h1>
        {watchlists.length > 0 ? (
          <ul className="menu bg-neutral w-56 rounded-box">
            {watchlists.map((w) => (
              <Link
                key={w._id.toString()}
                href={`/watchlist/${w._id}`}
                className="link"
              >
                <li className="menu-item">{w.name}</li>
              </Link>
            ))}
          </ul>
        ) : (
          <></>
        )}
        <button className="btn btn-primary" onClick={newWatchlist}>
          New Watchlist
        </button>
      </div>

      <div className="divider lg:divider-horizontal"></div>

      <div className="w-[50%] flex flex-col items-center space-y-2">
        <h1 className="text-xl text-primary">Reports</h1>
        {reports.length > 0 ? (
          <ul className="menu bg-neutral w-56 rounded-box">
            {reports.map((r) => (
              <Link
                key={r._id.toString()}
                href={`/report/${r._id}`}
                className="link"
              >
                <li className="menu-item">{r.name}</li>
              </Link>
            ))}
          </ul>
        ) : (
          <></>
        )}
        <button className="btn btn-primary" onClick={newReport}>
          New Report
        </button>
      </div>

      <div className="divider lg:divider-horizontal"></div>

      <div className="w-[50%] flex flex-col items-center space-y-2">
        <h1 className="text-xl text-primary">Friend Requests</h1>

        <p className="text-secondary">Incoming</p>
        {incomingFriendRequests.length === 0 ? (
          <p>No incoming friend requests</p>
        ) : (
          <ul className="menu bg-neutral w-80 rounded-box">
            {incomingFriendRequests.map((r) => (
              <li
                key={r._id.toString()}
                className="menu-item flex flex-row justify-between items-center"
              >
                {userElement(r)}
                <div className="flex flex-row w-[55%]">
                  <button
                    className="btn btn-success btn-sm w-[50%]"
                    onClick={(e) => acceptFriendRequest(e, r._id.toString())}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-error btn-sm w-[50%]"
                    onClick={(e) => declineFriendRequest(e, r._id.toString())}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-secondary">Outgoing</p>
        <div className="flex flex-row space-x-2">
          <input
            id="friend-request-email"
            type="text"
            className="input input-bordered text-primary"
            placeholder="Enter email"
            onSubmit={sendFriendRequest}
          />
          <button className="btn btn-primary" onClick={sendFriendRequest}>
            Send
          </button>
        </div>
        {outgoingFriendRequests.length === 0 ? (
          <p>No outgoing friend requests</p>
        ) : (
          <ul className="bg-neutral w-80 rounded-box menu">
            {outgoingFriendRequests.map((r) => (
              <li
                key={r._id.toString()}
                className="menu-item flex flex-row justify-between items-center"
              >
                {userElement(r)}
                <button
                  className="btn btn-error btn-sm w-[30%]"
                  onClick={(e) => declineFriendRequest(e, r._id.toString())}
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}

        <h1 className="text-xl text-primary">Friends</h1>
        {friendList.length === 0 ? (
          <p>No friends</p>
        ) : (
          <ul className="bg-neutral w-80 rounded-box pt-1">
            {friendList.map((r) => (
              <li
                key={r._id.toString()}
                className="pl-2 pr-2 pb-1 text-sm flex flex-row justify-between items-center"
              >
                {userElement(r)}
                <button
                  className="btn btn-error btn-sm w-[30%] float-right"
                  onClick={(e) => removeFriend(e, r._id.toString())}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

"use client";

import { User } from "next-auth";
import Link from "next/link";
import toast from "react-hot-toast";
import { NamedId } from "../lib/types";
import { useState } from "react";

export default function Dashboard(props: { user: User }) {
  const { watchlists, reports } = props.user;

  const [friends, setFriends] = useState<NamedId[]>(props.user.friends);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState<
    NamedId[]
  >(props.user.incomingFriendRequests);
  const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<
    NamedId[]
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
    e.preventDefault();

    const email = (
      document.getElementById("friend-request-email") as HTMLInputElement | null
    )?.value;

    if (!email) return;
    if (!email.includes("@")) {
      toast.error("Invalid email.");
      return;
    }

    console.log("Sending friend request to", email);
    const promise = fetch("/api/friends/request?email=" + email);
    toast.promise(promise, {
      loading: "Sending friend request...",
      success: "Friend request sent!",
      error: "Failed to send friend request.",
    });

    const res = await promise;
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return;
    }

    const data = json.data as { user: NamedId };
    setOutgoingFriendRequests([...outgoingFriendRequests, data.user]);
  }

  async function declineFriendRequest(e: any, id: string) {
    e.preventDefault();

    console.log("Declining friend request", id);
    const promise = fetch("/api/friends/decline?id=" + id);
    toast.promise(promise, {
      loading: "Declining friend request...",
      success: "Friend request declined!",
      error: "Failed to decline friend request.",
    });

    const res = await promise;
    const json = await res.json();
    if (json.error) {
      toast.error(json.error);
      return;
    }

    const data = json.data as { user: NamedId };

    setOutgoingFriendRequests(
      outgoingFriendRequests.filter((r) => r._id !== data.user._id)
    );
    setIncomingFriendRequests(
      incomingFriendRequests.filter((r) => r._id !== data.user._id)
    );
  }

  async function acceptFriendRequest(e: any, id: string) {
    e.preventDefault();

    console.log("Accepting friend request", id);
    const promise = fetch("/api/friends/accept?id=" + id);
    toast.promise(promise, {
      loading: "Accepting friend request...",
      success: "Friend request accepted!",
      error: "Failed to accept friend request.",
    });

    const res = await promise;
    const json = await res.json();

    if (json.error) {
      toast.error(json.error);
      return;
    }

    const data = json.data as { user: NamedId };

    setIncomingFriendRequests(
      incomingFriendRequests.filter((r) => r._id !== data.user._id)
    );
    setFriends([...friends, data.user]);
  }

  async function removeFriend(e: any, id: string) {
    e.preventDefault();

    if (!confirm("Are you sure you want to remove this friend?")) return;

    console.log("Removing friend", id);
    const promise = fetch("/api/friends/remove?id=" + id);
    toast.promise(promise, {
      loading: "Removing friend...",
      success: "Friend removed!",
      error: "Failed to remove friend.",
    });

    const res = await promise;
    const json = await res.json();

    if (json.error) {
      toast.error(json.error);
      return;
    }

    const data = json.data as { user: NamedId };

    setFriends(friends.filter((r) => r._id !== data.user._id));
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
                {r.name}
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
                {r.name}
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
        {friends.length === 0 ? (
          <p>No friends</p>
        ) : (
          <ul className="bg-neutral w-80 rounded-box pt-1">
            {friends.map((r) => (
              <li
                key={r._id.toString()}
                className="pl-2 pb-1 text-sm flex flex-row justify-between items-center"
              >
                <Link className="link" href={`/profile/${r._id.toString()}`}>
                  {r.name}
                </Link>
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

"use client";

import { User } from "next-auth";
import Link from "next/link";
import toast from "react-hot-toast";

export default async function Dashboard(props: { user: User }) {
  const { watchlists, reports } = props.user;

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
    }
  }

  return (
    <div className="w-fit flex-1 flex items-center justify-center flex-row">
      <div className="w-[50%] flex flex-col items-center space-y-2">
        <h1 className="text-xl">Watchlists</h1>
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
        <h1 className="text-xl">Reports</h1>
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
        <h1 className="text-xl">Friend Requests</h1>

        <p>Incoming</p>
        {props.user.incomingFriendRequests.length === 0 ? (
          <p>No incoming friend requests</p>
        ) : (
          <ul className="menu bg-neutral w-56 rounded-box">
            {props.user.incomingFriendRequests.map((r) => (
              <li key={r._id.toString()} className="menu-item">
                {r.name}
              </li>
            ))}
          </ul>
        )}

        <p>Outgoing</p>
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
        {props.user.outgoingFriendRequests.length === 0 ? (
          <p>No outgoing friend requests</p>
        ) : (
          <ul className="menu bg-neutral w-56 rounded-box">
            {props.user.outgoingFriendRequests.map((r) => (
              <li key={r._id.toString()} className="menu-item">
                {r.name}
              </li>
            ))}
          </ul>
        )}

        <h1 className="text-xl">Friends</h1>
        {props.user.friends.length === 0 ? (
          <p>No friends</p>
        ) : (
          <ul className="menu bg-neutral w-56 rounded-box">
            {props.user.friends.map((r) => (
              <li key={r._id.toString()} className="menu-item">
                {r.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

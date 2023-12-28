import toast from "react-hot-toast";
import { NamedId, UserId } from "./types";
import { User } from "next-auth";
export class friends {
  static async sendFriendRequest(e: any): Promise<UserId | null | undefined> {
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

    const data = json.data as { user: UserId };
    return data.user;
  }

  static async declineFriendRequest(
    e: any,
    id: string
  ): Promise<UserId | undefined> {
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

    const data = json.data as { user: UserId };
    return data.user;
  }

  static async acceptFriendRequest(
    e: any,
    id: string
  ): Promise<UserId | undefined> {
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

    const data = json.data as { user: UserId };
    return data.user;
  }

  static async removeFriend(e: any, id: string): Promise<UserId | undefined> {
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

    const data = json.data as { user: UserId };
    return data.user;
  }
}

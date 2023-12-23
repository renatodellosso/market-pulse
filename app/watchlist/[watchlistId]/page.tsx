"use server";

import { getWatchlist } from "@/lib/db/watchlists";
import ClientPage from "./clientpage";
import { watch } from "fs";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

// Fetch data at request time, then pass to a client component, thus avoiding having to write an API route
export default async function Page({
  params,
}: {
  params: { watchlistId: string };
}) {
  // Get watchlist
  const { watchlistId } = params;
  const watchlist = await getWatchlist(watchlistId);

  if (!watchlist) return <div>Watchlist not found</div>;

  watchlist._id = watchlistId;

  // Check if user is authorized to view this watchlist
  const session = await getServerSession(authOptions);
  // At some point, we should set up the Next-Auth middleware to protect pages, but this works for now
  if (!session) redirect("/api/auth/signin");
  if (watchlist.ownerEmail !== session.user?.email)
    return <div>Not authorized</div>;

  return <ClientPage watchlist={watchlist} />;
}

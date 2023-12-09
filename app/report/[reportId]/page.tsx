"use server"

import { getWatchlist } from "@/lib/db/watchlists"
import ClientPage from "./clientpage";
import { watch } from "fs";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getReport } from "@/lib/db/reports";
import { getUser, getUserByEmail } from "@/lib/db/users";

// Fetch data at request time, then pass to a client component, thus avoiding having to write an API route
export default async function Page({ params }: { params: { reportId: string } }) {
    // Get watchlist
    const { reportId } = params
    const report = await getReport(reportId);

    if(!report) return <div>Report not found</div>

    report._id = reportId;

    // Check if user is authorized to view this watchlist
    const session = await getServerSession(authOptions);
    // At some point, we should set up the Next-Auth middleware to protect pages, but this works for now
    if(!session) redirect("/api/auth/signin");
    if(report.ownerEmail !== session.user?.email) return <div>Not authorized</div>

    report.watchlist._id = report.watchlist?._id?.toString() ?? "Null";

    const user = await getUserByEmail(session.user?.email);
    const watchlists = user!.watchlists;

    watchlists.forEach(element => {
        element._id = element._id.toString();
    });

    return <ClientPage report={report} watchlists={watchlists} />
}
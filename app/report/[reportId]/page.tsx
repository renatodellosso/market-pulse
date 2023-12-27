"use server";

import ClientPage from "./clientpage";
import { getServerSession } from "next-auth";
import authOptions from "../../api/auth/authoptions";
import { getReport } from "@/lib/db/reports";
import { getUserByEmail } from "@/lib/db/users";

// Fetch data at request time, then pass to a client component, thus avoiding having to write an API route
export default async function Page({
  params,
}: {
  params: { reportId: string };
}) {
  // Get watchlist
  const { reportId } = params;
  const report = await getReport(reportId);

  if (!report) return <div>Report not found</div>;

  report._id = reportId;

  // Check if user is authorized to view this watchlist
  const session = await getServerSession(authOptions);

  report.watchlist._id = report.watchlist?._id?.toString() ?? "Null";

  const user = session ? await getUserByEmail(session.user?.email ?? "") : null;
  const watchlists = user?.watchlists ?? [];

  watchlists.forEach((element) => {
    element._id = element._id.toString();
  });

  return (
    <ClientPage
      report={report}
      watchlists={watchlists}
      edit={(session && report.ownerEmail == session.user.email) ?? false}
    />
  );
}

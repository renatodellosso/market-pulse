import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
<<<<<<< HEAD
import {
  getReport,
  setData,
  setFrequency,
  setWatchlist,
  updateName,
} from "@/lib/db/reports";
import { NextRequest, NextResponse } from "next/server";
import { getWatchlist } from "@/lib/db/watchlists";
=======
import { getReport, setData } from "@/lib/db/reports";
import { NextRequest, NextResponse } from "next/server";
>>>>>>> 3ff5ce9924251a2a24fc7dafae90ecf3c3812bbe
import { ReportData, ReportFrequency } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read query params
  const params = new URL(req.url!).searchParams;
  let id: ObjectId | string = params.get("id")!;
  let dataString = params.get("data");
  let data: string[] | string | undefined = dataString?.split(",");

  console.log("Setting report data... Data: " + data);

  const report = await getReport(id);

  if (!report)
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.ownerEmail != session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (data) {
    if (typeof data == "string") {
      if (!ReportData.data.includes(data))
        return NextResponse.json({ error: "Invalid data" }, { status: 400 });
      data = [data];
    } else if (Array.isArray(data)) {
      // Avoids issues with spaces in the URL
      for (let i = 0; i < data.length; i++)
        data[i] = data[i].replace("%20", "% ");

      data = data.filter((d) => ReportData.data.includes(d));
    }
  } else data = [];

  id = new ObjectId(id!);

  await setData(id, data);

  return NextResponse.json({ id: id });
}

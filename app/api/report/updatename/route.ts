import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/authoptions";
import { ObjectId } from "mongodb";
import { getReport, updateName } from "@/lib/db/reports";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read query params
  const params = new URL(req.url!).searchParams;
  let id: ObjectId | string = params.get("id")!;
  const name = params.get("name");

  console.log("Updating report name: " + name);

  const report = await getReport(id);

  if (!report)
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.ownerEmail != session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  id = new ObjectId(id!);

  updateName(session.user.email, id, name!);

  return NextResponse.json({ id: id, name: name });
}

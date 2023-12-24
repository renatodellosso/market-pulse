import { getUsers } from "@/lib/db/db";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getUser, getUserByEmail, initUser } from "@/lib/db/users";
import { request } from "http";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url!).searchParams;
  const id = params.get("id");

  // Verify the request

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  session.user =
    (await getUserByEmail(session.user.email ?? "")) ?? session.user;

  if (
    !session.user.incomingFriendRequests.find(
      (request) => request._id.toString() == id.toString()
    ) &&
    !session.user.outgoingFriendRequests.find(
      (request) => request._id.toString() == id.toString()
    )
  )
    return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const user = await getUser(id);

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Request looks good, remove the request

  const users = await getUsers();

  users.updateOne(
    { _id: new ObjectId(session.user._id) },
    {
      $pull: {
        outgoingFriendRequests: {
          _id: new ObjectId(id),
        },
        incomingFriendRequests: {
          _id: new ObjectId(id),
        },
      },
    }
  );

  users.updateOne(
    { _id: new ObjectId(user._id) },
    {
      $pull: {
        outgoingFriendRequests: {
          _id: new ObjectId(session.user._id),
        },
        incomingFriendRequests: {
          _id: new ObjectId(session.user._id),
        },
      },
    }
  );

  return NextResponse.json({
    status: 200,
    data: {
      user: {
        _id: user._id,
        name: user.name,
      },
    },
  });
}

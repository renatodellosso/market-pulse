import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "../../auth/authoptions";
import { getUserByEmail } from "@/lib/db/users";
import { getUsers } from "@/lib/db/db";
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

  if (!session.user.friends.find((friend) => friend._id.toString() == id))
    return NextResponse.json({ error: "Friend not found" }, { status: 404 });

  // Request looks good, remove the friend

  const users = await getUsers();

  users.updateOne(
    { _id: new ObjectId(session.user._id) },
    {
      $pull: {
        friends: {
          _id: new ObjectId(id),
        },
      },
    }
  );

  users.updateOne(
    { _id: new ObjectId(id) },
    {
      $pull: {
        friends: {
          _id: new ObjectId(session.user._id),
        },
      },
    }
  );

  return NextResponse.json({
    status: 200,
    data: {
      user: {
        _id: id,
      },
    },
  });
}

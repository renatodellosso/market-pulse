import { getUsers } from "@/lib/db/db";
import { getServerSession } from "next-auth";
import authOptions from "../../auth/authoptions";
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, initUser } from "@/lib/db/users";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url!).searchParams;
  const email = params.get("email");

  // Verify the request

  if (!email)
    return NextResponse.json({ error: "Missing email" }, { status: 400 });

  let user = await getUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  session.user =
    (await getUserByEmail(session.user.email ?? "")) ?? session.user;

  if (user.email == session.user.email)
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

  if (!user.friends) {
    await initUser(user);
    user = await getUserByEmail(email);

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (
    user.friends.find(
      (friend) => friend._id.toString() == session.user._id.toString()
    )
  )
    return NextResponse.json({ error: "Already friends" }, { status: 400 });

  if (
    user.incomingFriendRequests.find(
      (request) => request._id.toString() == session.user._id.toString()
    )
  )
    return NextResponse.json({ error: "Already requested" }, { status: 400 });

  if (
    session.user.incomingFriendRequests.find(
      (request) => request._id.toString() == user?._id.toString()
    )
  )
    return NextResponse.json(
      { error: "They have already sent you a request. Accept that request" },
      { status: 400 }
    );

  // Request looks good, add the request

  const users = await getUsers();

  users.updateOne(
    { email: email },
    {
      $push: {
        incomingFriendRequests: {
          _id: session.user._id,
          name: session.user.name!,
        },
      },
    }
  );

  users.updateOne(
    { email: session.user.email },
    {
      $push: {
        outgoingFriendRequests: {
          _id: user._id,
          name: user.name!,
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

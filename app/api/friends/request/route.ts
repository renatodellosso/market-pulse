import { getUsers } from "@/lib/db/db";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getUser, getUserByEmail, initUser } from "@/lib/db/users";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url!).searchParams;
  const email = params.get("email");

  // Verify the request

  console.log("Checking email...");
  if (!email)
    return NextResponse.json({ error: "Missing email" }, { status: 400 });

  console.log("Checking user...");
  let user = await getUserByEmail(email);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  session.user =
    (await getUserByEmail(session.user.email ?? "")) ?? session.user;

  console.log("Checking if request is to self...");
  if (user.email == session.user.email)
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

  if (!user.friends) {
    await initUser(user);
    user = await getUserByEmail(email);

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  console.log("Checking if already friends...");
  if (
    user.friends.includes({ _id: session.user._id, name: session.user.name! })
  )
    return NextResponse.json({ error: "Already friends" }, { status: 400 });

  console.log("Checking if already requested...");
  if (
    user.incomingFriendRequests.includes({
      _id: session.user._id,
      name: session.user.name!,
    })
  )
    return NextResponse.json({ error: "Already requested" }, { status: 400 });

  console.log("Checking if has incoming request request...");
  if (
    session.user.incomingFriendRequests.includes({
      _id: user._id,
      name: user.name!,
    })
  )
    return NextResponse.json(
      { error: "They have already sent you a request. Accept that request" },
      { status: 400 }
    );

  // Request looks good, add the request
  console.log("Adding request...");

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

  return NextResponse.json({ status: 200 });
}

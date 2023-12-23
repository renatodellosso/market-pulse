import { getUsers } from "@/lib/db/db";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { getUser, initUser } from "@/lib/db/users";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url!).searchParams;
  const email = params.get("email");

  // Verify the request

  if (!email)
    return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const users = await getUsers();
  let user = await users.findOne({ email });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.email == session.user.email)
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });

  if (!user.friends) {
    await initUser(user);
    user = await getUser(email);

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (
    user.friends.includes({ _id: session.user._id, name: session.user.name! })
  )
    return NextResponse.json({ error: "Already friends" }, { status: 400 });

  if (
    user.incomingFriendRequests.includes({
      _id: session.user._id,
      name: session.user.name!,
    })
  )
    return NextResponse.json({ error: "Already requested" }, { status: 400 });

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

  users.updateOne(
    { email },
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

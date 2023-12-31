"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignIn() {
  const { data: session, status } = useSession();

  return status == "unauthenticated" ? (
    <button className="btn btn-primary" onClick={() => signIn("google")}>
      Sign In With Google
    </button>
  ) : (
    <button className="btn btn-primary" onClick={() => signOut()}>
      Sign Out
    </button>
  );
}

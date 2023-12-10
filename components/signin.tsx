"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function SignIn() {
  const { data: session, status } = useSession();

  return status == "authenticated" ? (
    <button className="btn btn-primary" onClick={() => signOut()}>
      Sign Out
    </button>
  ) : (
    <button className="btn btn-primary" onClick={() => signIn()}>
      Sign In
    </button>
  );
}

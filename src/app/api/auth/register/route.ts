import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUser, createSessionToken } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, major } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const userProfile = await createUser({
      email,
      password,
      fullName,
      major,
    });

    const token = createSessionToken(userProfile);

    const cookieStore = await cookies();
    cookieStore.set("cognita_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to register user.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

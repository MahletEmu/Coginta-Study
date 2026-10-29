import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByEmail, verifyPassword, createSessionToken } from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const userRecord = await findUserByEmail(email);
    if (!userRecord) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, userRecord.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const userProfile = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      major: userRecord.major,
      createdAt: userRecord.createdAt,
    };

    const token = createSessionToken(userProfile);

    const cookieStore = await cookies();
    cookieStore.set("cognita_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to sign in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

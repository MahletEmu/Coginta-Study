import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth-service";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("cognita_session")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const userProfile = verifySessionToken(token);
    if (!userProfile) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: userProfile,
    });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}

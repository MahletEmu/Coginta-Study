import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./client";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If Supabase is not configured yet, allow guest exploration
  if (!isSupabaseConfigured()) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid using supabase.auth.getSession() in server code.
  // Use getUser() to validate auth status with Supabase Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith("/auth");
  const isPublicRoute =
    isAuthRoute ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  // If user is not logged in and attempts to access protected routes, redirect to login
  if (!user && !isPublicRoute) {
    // Only redirect if Supabase is fully configured
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If user is logged in and visits /auth/login or /auth/register, redirect to dashboard
  if (user && isAuthRoute && !pathname.startsWith("/auth/callback") && !pathname.startsWith("/auth/reset-password")) {
    const url = request.nextUrl.clone();
    const redirectParam = request.nextUrl.searchParams.get("redirect") || "/";
    url.pathname = redirectParam;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

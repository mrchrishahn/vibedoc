import { createClient } from "~/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirect to the dashboard on successful verification
      return NextResponse.redirect(new URL("/projects", requestUrl.origin));
    }
  }

  // If there's an error or no code, redirect to the login page
  return NextResponse.redirect(new URL("/", requestUrl.origin));
} 
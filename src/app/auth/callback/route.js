import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");
	const next = searchParams.get("next") ?? "/";

	if (code) {
		const cookieStore = await cookies();
		const supabase = createClient(cookieStore);
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error) {
			// redirect user to specified redirect URL or root of app
			const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer

			const isLocalEnv = process.env.NODE_ENV === "development";
			if (isLocalEnv) {
				// we can be sure that there is no load balancer in between, so no need to watch for x-forwarded-host
				return NextResponse.redirect(`${origin}${next}`);
			} else if (forwardedHost) {
				return NextResponse.redirect(`https://${forwardedHost}${next}`)
			} else {
				return NextResponse.redirect(`${origin}${next}`)
			}
		}
	}

	// if there is no code redirect the user to an login page with some message
	return NextResponse.redirect(`${origin}/login?message=failed to authenticate user with provider`)
}

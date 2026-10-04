"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export async function handleEmailLogin(formData) {
	const cookieStore = await cookies();
	const supabase = createClient(cookieStore);

	const data = {
		email: formData.get("email"),
		password: formData.get("password"),
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		console.error('error while logging in through email: ', error.message);
    return redirect(`/login?error=${encodeURIComponent(error.message)}&t=${Date.now()}`)
	}

	return redirect("/");
}

export async function handleSignUp(formData) {
	const cookieStore = await cookies();
	const supabase = createClient(cookieStore);

	const data = {
		email: formData.get("email"),
		password: formData.get("password"),
		options: {
			data: {
				full_name: formData.get("username"),
			},
		},
	};


	const { error } = await supabase.auth.signUp(data);

	// email confirmation is off so it will return a authenticated session if everything is okay it will go to /

  if (error) {
    console.error('error while signing up through email: ', error.message);
    return redirect(`/signup?error=${encodeURIComponent(error.message)}&t=${Date.now()}`)
  }

  return redirect("/");
}

export async function handleSignOut() {
	const supabase = createClient(await cookies());
	const { error }	= await supabase.auth.signOut();

	if (error) {
    console.error('error while signing out: ', error.message);
    return redirect(`/?error=${encodeURIComponent(error.message)}&t=${Date.now()}`)
	}
}

export async function handleOAuth(provider) {
	if (!provider) {
	  console.error('Invalid provider: ', provider)
    return redirect(`/login?error=${encodeURIComponent("Invalid provider")}&t=${Date.now()}`)
	}

	const cookieStore = await cookies();
	const supabase = createClient(cookieStore);

	const redirectURL = process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL
		? `${process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL}/auth/callback`
		: "http://localhost:3000/auth/callback";

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: provider,
		options: {
			redirectTo: redirectURL,
		},
	});

	if (error) {
		console.error(error.message);
		return redirect(`/login?error=${encodeURIComponent(error.message)}&t=${Date.now()}`)
	}

	return redirect(data.url);
}

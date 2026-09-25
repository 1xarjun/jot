// In Next.js, route.ts (or route.tsx) is typically used inside the app directory when creating API routes in the App Router (Next.js 13+ with server components and API routes in /app/api/).

// this handles verifying the token after redirect

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/login?message=Could not verify OTP')
}
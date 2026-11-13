import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import OAuthProviders from "../login/oauth-providers";
import SignupForm from "./signup-form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Signup() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-12 text-sm">
      <Card className="w-full max-w-md">
        <CardHeader className="mb-2">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account.
          </CardDescription>
          <CardAction>
            <Link className={buttonVariants({ variant: "link" })} href="/login">
              Login
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <SignupForm />
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <OAuthProviders />
        </CardFooter>
      </Card>
    </div>
  );
}

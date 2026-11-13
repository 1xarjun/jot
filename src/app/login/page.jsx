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
import OAuthProviders from "./oauth-providers";
import LoginForm from "./login-form";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Login() {
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
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your credentials below to login to your account.
          </CardDescription>
          <CardAction>
            <Link className={buttonVariants({ variant: "link" })} href="/signup">
              Sign up
            </Link>
          </CardAction>
        </CardHeader>

        <CardContent>
          <LoginForm />
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <OAuthProviders />
        </CardFooter>
      </Card>
    </div>
  );
}

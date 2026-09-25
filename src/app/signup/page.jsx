import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { handleSignUp } from "../login/actions";
import OAuthProviders from "../login/oauth-providers";
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
          <form id="signup-form" action={handleSignUp} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-start font-medium text-foreground">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            form="signup-form"
            className="w-full justify-center gap-2"
          >
            <Mail />
            Sign up with Email
          </Button>
          <OAuthProviders />
        </CardFooter>
      </Card>
    </div>
  );
}

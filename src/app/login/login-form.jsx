"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { handleEmailLogin } from "../actions/actions";

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await handleEmailLogin(new FormData(event.currentTarget));

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      window.location.replace("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="login-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="name@example.com" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full justify-center gap-2.5">
        <Mail />
        {isSubmitting ? "Logging in..." : "Login with Email"}
      </Button>
    </form>
  );
}

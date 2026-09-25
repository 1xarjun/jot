"use client";

import { GithubIcon } from "@/components/icons/Icons";
import { Button } from "@/components/ui/button";
import { handleOAuth } from "./actions";

export default function OAuthProviders() {
  return (
    <Button
      onClick={async () => await handleOAuth("github")}
      className="gap-2.5 w-full justify-center"
      variant="outline"
    >
      <GithubIcon className="fill-current" />
      Continue with Github
    </Button>
  );
}

"use client"

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function Error() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error')
  const t = searchParams.get('t')

  useEffect(() => {
    if (error && t) toast.error(error)
  }, [error, t]);

  return null;
}

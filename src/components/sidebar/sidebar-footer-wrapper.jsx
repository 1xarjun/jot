import { createClient } from "@/utils/supabase/server";
import SidebarUser from "../SidebarUser";
import { cookies } from "next/headers";

export default async function SidebarFooterWrapper() {
  const supabase = createClient(await cookies())
  const { data: { user } } = await supabase.auth.getUser();
  return <SidebarUser user={user} />
}

import SidebarWrapper from "@/components/SidebarWrapper";
import UserSkeleton from "@/components/skeletons/user-skeleton";
import { Suspense } from "react";
import SidebarContentWrapper from "@/components/sidebar/sidebar-content-wrapper";
import SidebarFooterWrapper from "@/components/sidebar/sidebar-footer-wrapper";
import NotesStoreProvider from "@/context/notes-store-provider";
import EditorProvider from "@/context/EditorProvider";
import Search from "@/components/search";
import NotesWrapper from "@/components/sidebar/notes-wrapper";
import NotesSkeleton from "@/components/skeletons/notes-skeleton";
import { fetchAll, fetchShared } from "../actions/notes";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function RootLayout({ children }) {

    const supabase = createClient(await cookies());
    const { data: { session } } = await supabase.auth.getSession();

    const serverPromise = Promise.all([
      session?.user ? fetchAll() : Promise.resolve({ success: true, data: [] }),
      session?.user ? fetchShared() : Promise.resolve({ success: true, data: [] })
    ]);

    return (
    <NotesStoreProvider initialValue={{ notes: [], shared: [] }}>
    <EditorProvider>
        <div className="text-sm text-foreground bg-background w-full h-dvh overflow-hidden flex">
          <SidebarWrapper>
            <SidebarContentWrapper>
              <Suspense fallback={<NotesSkeleton />}>
                <NotesWrapper promise={serverPromise} />
              </Suspense>
            </SidebarContentWrapper>
            <Suspense fallback={<UserSkeleton />}>
              <SidebarFooterWrapper />
            </Suspense>
          </SidebarWrapper>
          <Search />
          <main className="w-full">{children}</main>
        </div>
      </EditorProvider>
    </NotesStoreProvider>
  );
}

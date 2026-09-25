import SidebarWrapper from "@/components/SidebarWrapper";
import UserSkeleton from "@/components/skeletons/user-skeleton";
import { Suspense } from "react";
import SidebarContentWrapper from "@/components/sidebar/sidebar-content-wrapper";
import SidebarFooterWrapper from "@/components/sidebar/sidebar-footer-wrapper";
import { fetchAll, fetchShared } from "../actions/notes";
import NotesStoreProvider from "@/context/notes-store-provider";
import EditorProvider from "@/context/EditorProvider";
import Search from "@/components/search";

export default async function RootLayout({ children }) {

  const [
    { data: notes },
    { data: sharedEntries }
  ] = await Promise.all([
    fetchAll(),
    fetchShared()
  ]);

  return (
    <NotesStoreProvider initialValue={{ notes: notes ?? [], shared: sharedEntries ?? [] }}>
      <EditorProvider>
        <div className="text-sm text-foreground bg-background w-full h-dvh overflow-hidden flex">
          <SidebarWrapper>
            <SidebarContentWrapper />
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

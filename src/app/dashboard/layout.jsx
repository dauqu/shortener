"use client";
import { Search } from "@/app/components/search";
import { UserNav } from "@/app/components/user-nav";

export default function Layout({ children }) {
  return (
    <>
      <div className="flex-col md:flex justify-center">
        {/* Header */}
        <div className="border-b w-full bg-black">
          <div className="flex h-16 items-center px-4 justify-between">
            {/* <TeamSwitcher /> */}
            <div>
              <span className="text-xl text-white font-extrabold underline-offset-8 underline">
                Mahadevan
              </span>
            </div>
            {/* <MainNav className="mx-6 ml-10" /> */}
            <div className="ml-auto flex items-center space-x-4">
              <Search />
              <UserNav />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
      </div>
    </>
  );
}

import { Outlet } from "react-router-dom";
import { useState } from "react";
import { StudentSidebar } from "@/components/navigation/StudentSidebar";
import { StudentTopbar } from "@/components/navigation/StudentTopbar";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";

export function StudentAppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="compass-app-bg min-h-screen text-slate-950">
      <StudentSidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="lg:pl-72">
        <StudentTopbar onOpenMenu={() => setMobileMenuOpen(true)} />
        <main id="main-content" className="compass-page-enter mx-auto w-full max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  Compass,
  House,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthProvider";

const nav = [
  ["/admin/dashboard", "Overview", LayoutDashboard],
  ["/admin/users", "Students", UsersRound],
  ["/admin/accommodation", "Accommodation", House],
  ["/admin/community", "Community", MessageSquareText],
  ["/admin/events", "Events", CalendarDays],
  ["/admin/opportunities", "Opportunities", Sparkles],
  ["/admin/safety", "Safety", ShieldAlert],
  ["/admin/locations", "Locations", MapPinned],
  ["/admin/information", "Information", BookOpen],
] as const;

export function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="h-[100dvh] min-h-0 overflow-hidden bg-slate-50 text-slate-950">
      <div className="flex h-full min-h-0 min-w-0">
        {/* =====================================================
            DESKTOP SIDEBAR
            ===================================================== */}

        <aside
          className="
            hidden
            h-full
            w-[264px]
            shrink-0
            border-r border-blue-100
            bg-white
            lg:flex
            lg:flex-col
          "
        >
          {/* ===================================================
              SIDEBAR BRAND
              =================================================== */}

          <div className="shrink-0 px-5 pb-4 pt-5">
            <div className="flex min-w-0 items-center gap-3 px-2">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/15">
                <Compass className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">
                  DELSU Compass
                </p>

                <p className="truncate text-xs text-slate-400">Admin console</p>
              </div>
            </div>
          </div>

          {/* ===================================================
              SCROLLABLE NAVIGATION
              =================================================== */}

          <div className="min-h-0 flex-1 overflow-hidden px-5">
            <nav
              className="
                h-full
                min-h-0
                space-y-1
                overflow-y-auto
                overflow-x-hidden
                pb-4
                pr-1
                [scrollbar-width:thin]
              "
            >
              {nav.map(([to, label, Icon]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `
                      flex min-w-0 items-center gap-3
                      rounded-2xl
                      px-3 py-2.5
                      text-sm font-semibold
                      transition
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-800 ring-1 ring-blue-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-800"
                      }
                    `
                  }
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl">
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 truncate">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* ===================================================
              SIDEBAR ACCOUNT / LOGOUT
              =================================================== */}

          <div className="shrink-0 border-t border-slate-100 bg-white px-5 pb-5 pt-4">
            <div className="mb-3 min-w-0 px-3">
              <p className="truncate text-xs font-semibold text-slate-700">
                {user?.fullName}
              </p>

              <p className="truncate text-[11px] text-slate-400">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="
                flex h-11 w-full min-w-0
                items-center gap-3
                rounded-2xl
                px-3
                text-sm font-semibold text-slate-600
                transition
                hover:bg-red-50
                hover:text-red-700
              "
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl">
                <LogOut className="h-4 w-4" />
              </span>

              <span className="truncate">Log out</span>
            </button>
          </div>
        </aside>

        {/* =====================================================
            RIGHT SIDE
            ===================================================== */}

        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          {/* ===================================================
              MOBILE NAVIGATION
              =================================================== */}

          <div
            className="
              z-40
              flex shrink-0
              gap-2
              overflow-x-auto
              border-b border-blue-100
              bg-white/95
              px-4 py-3
              backdrop-blur-xl
              lg:hidden
            "
          >
            {nav.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `
                    shrink-0 whitespace-nowrap
                    rounded-full
                    px-3.5 py-2
                    text-xs font-semibold
                    transition
                    ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }
                  `
                }
              >
                {label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={signOut}
              className="
                shrink-0 whitespace-nowrap
                rounded-full
                bg-red-50
                px-3.5 py-2
                text-xs font-semibold text-red-700
                transition
                hover:bg-red-100
              "
            >
              Log out
            </button>
          </div>

          {/* ===================================================
              SCROLLABLE ADMIN CONTENT
              =================================================== */}

          <main
            className="
              min-h-0
              min-w-0
              flex-1
              overflow-y-auto
              overflow-x-hidden
              overscroll-contain
              bg-slate-50
            "
          >
            <div className="compass-page-enter min-w-0">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

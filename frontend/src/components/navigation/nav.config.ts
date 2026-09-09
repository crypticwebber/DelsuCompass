import {
  Bell,
  BookOpenCheck,
  CalendarDays,
  CircleDollarSign,
  Compass,
  Home,
  House,
  LogOut,
  MapPinned,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

export const primaryStudentNav = [
  { label: "Dashboard", to: "/app/dashboard", icon: Home },
  { label: "Timetable", to: "/app/timetable", icon: CalendarDays },
  { label: "Reminders", to: "/app/reminders", icon: Bell },
  { label: "Accommodation", to: "/app/accommodation", icon: House },
  { label: "Budget", to: "/app/budget", icon: CircleDollarSign },
  { label: "Safety", to: "/app/safety", icon: ShieldCheck },
  { label: "Community", to: "/app/community", icon: MessageSquareText },
  { label: "Events", to: "/app/events", icon: CalendarDays },
  { label: "Opportunities", to: "/app/opportunities", icon: Sparkles },
  { label: "Campus Map", to: "/app/map", icon: MapPinned },
];

// Kept for type compatibility with older imports. Search, notifications and profile
// live in the top bar so they are intentionally not repeated in the sidebar.
export const utilityStudentNav: typeof primaryStudentNav = [];
export const logoutNavItem = { label: "Log out", to: "#logout", icon: LogOut };

export const mobileStudentNav = [
  { label: "Home", to: "/app/dashboard", icon: Home },
  { label: "Classes", to: "/app/timetable", icon: BookOpenCheck },
  { label: "Compass", to: "/app/map", icon: Compass },
  { label: "Community", to: "/app/community", icon: MessageSquareText },
  { label: "Profile", to: "/app/profile", icon: UserRound },
];

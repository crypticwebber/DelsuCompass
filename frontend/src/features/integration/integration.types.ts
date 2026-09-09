export type DashboardClass = {
  _id: string;
  courseCode: string;
  courseTitle: string;
  day: string;
  startTime: string;
  endTime: string;
  venue: string;
  isCarryOver?: boolean;
};

export type DashboardSafetyAlert = {
  _id: string;
  title: string;
  severity: "low" | "moderate" | "high" | "critical";
  area: string;
  publishedAt: string;
};

export type DashboardEvent = {
  _id: string;
  title: string;
  startDate: string;
  venue: string;
  category: string;
};

export type DashboardOpportunity = {
  _id: string;
  title: string;
  type: string;
  provider: string;
  deadline?: string;
};

export type DashboardNotice = {
  id: string;
  title: string;
  summary: string;
  category: string;
  importantDate?: string;
  isFeatured: boolean;
};

export type DashboardIntegration = {
  generatedAt: string;
  today: string;
  classes: DashboardClass[];
  safetyAlerts: DashboardSafetyAlert[];
  events: DashboardEvent[];
  opportunities: DashboardOpportunity[];
  notices: DashboardNotice[];
  budget: {
    month: string;
    spendingLimit: number;
    totalSpent: number;
    remaining: number;
    overspent: number;
    transactionCount: number;
  };
  unreadNotifications: number;
  partialFailures?: string[];
};

import { TimetableEntryModel } from "../timetable/timetable.model.js";
import { SafetyAlertModel } from "../safety/safety-alert.model.js";
import { EventModel } from "../events/event.model.js";
import { OpportunityModel } from "../opportunities/opportunity.model.js";
import { InformationNoticeModel } from "../information/information-notice.model.js";
import { budgetService } from "../budget/budget.service.js";
import { notificationService } from "../notifications/notification.service.js";

const weekDays = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"] as const;

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,"0")}`;
}

export const integrationService = {
  async dashboard(userId: string) {
    const now = new Date();
    const today = weekDays[now.getDay()];
    const next14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const results = await Promise.allSettled([
      TimetableEntryModel.find({ userId, day: today }).sort({ startTime: 1 }).lean(),
      SafetyAlertModel.find({ status: "active", $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }).sort({ severity: -1, publishedAt: -1 }).limit(4).lean(),
      EventModel.find({ status: "approved", startDate: { $gte: now, $lte: next14Days } }).sort({ startDate: 1 }).limit(4).lean(),
      OpportunityModel.find({ status: "approved", $or: [{ deadline: null }, { deadline: { $gte: now } }] }).sort({ deadline: 1, createdAt: -1 }).limit(4).lean(),
      InformationNoticeModel.find({ status: "published", audience: { $in: ["students", "all"] }, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }).sort({ isFeatured: -1, importantDate: 1, publishedAt: -1 }).limit(4).lean(),
      budgetService.summary(userId, currentMonth()),
      notificationService.unreadCount(userId),
    ] as const);

    const partialFailures: string[] = [];
    const value = <T>(index: number, fallback: T, label: string): T => {
      const result = results[index];
      if (result.status === "fulfilled") return result.value as T;
      partialFailures.push(label);
      console.error(`[dashboard] ${label} projection failed`, result.reason);
      return fallback;
    };

    const classes = value<any[]>(0, [], "timetable");
    const safetyAlerts = value<any[]>(1, [], "safety");
    const events = value<any[]>(2, [], "events");
    const opportunities = value<any[]>(3, [], "opportunities");
    const notices = value<any[]>(4, [], "information");
    const budget = value<any>(5, { month: currentMonth(), plan: null, totalSpent: 0, remaining: 0, overspent: 0, transactionCount: 0 }, "budget");
    const unreadNotifications = value<number>(6, 0, "notifications");

    return {
      generatedAt: now.toISOString(),
      today,
      partialFailures,
      classes,
      safetyAlerts,
      events,
      opportunities,
      notices: notices.map((n: any) => ({
        id: String(n._id),
        title: n.title,
        summary: n.summary,
        category: n.category,
        importantDate: n.importantDate,
        isFeatured: n.isFeatured,
      })),
      budget: {
        month: budget.month,
        spendingLimit: budget.plan?.spendingLimit ?? 0,
        totalSpent: budget.totalSpent ?? 0,
        remaining: budget.remaining ?? 0,
        overspent: budget.overspent ?? 0,
        transactionCount: budget.transactionCount ?? 0,
      },
      unreadNotifications,
    };
  },
};

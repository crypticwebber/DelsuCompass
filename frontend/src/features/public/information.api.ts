import { apiClient } from "@/services/api/axios";
import type { ExploreData, GuideArticle, InformationNotice } from "./information.types";

type R<T> = { success: true; data: T };

function isoOrUndefined(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : value;
}

function cleanNotice(body: Partial<InformationNotice>) {
  return {
    title: cleanText(body.title),
    summary: cleanText(body.summary),
    content: cleanText(body.content),
    category: body.category,
    audience: body.audience,
    importantDate: isoOrUndefined(body.importantDate),
    sourceUrl: typeof body.sourceUrl === "string" && body.sourceUrl.trim() ? body.sourceUrl.trim() : undefined,
    sourceLabel: typeof body.sourceLabel === "string" && body.sourceLabel.trim() ? body.sourceLabel.trim() : undefined,
    isFeatured: body.isFeatured ?? false,
    status: body.status,
    expiresAt: isoOrUndefined(body.expiresAt),
  };
}

function cleanGuide(body: Partial<GuideArticle>) {
  return {
    title: cleanText(body.title),
    category: body.category,
    excerpt: cleanText(body.excerpt),
    content: cleanText(body.content),
    sourceUrl: typeof body.sourceUrl === "string" && body.sourceUrl.trim() ? body.sourceUrl.trim() : undefined,
    sourceLabel: typeof body.sourceLabel === "string" && body.sourceLabel.trim() ? body.sourceLabel.trim() : undefined,
    sortOrder: body.sortOrder ?? 0,
    isPublished: body.isPublished ?? false,
  };
}

export const informationApi = {
  async explore() { const { data } = await apiClient.get<R<ExploreData>>("/information/explore"); return data.data; },
  async notices(params?: Record<string, string>) { const { data } = await apiClient.get<R<InformationNotice[]>>("/information/notices", { params }); return data.data; },
  async guides(params?: Record<string, string>) { const { data } = await apiClient.get<R<GuideArticle[]>>("/information/guides", { params }); return data.data; },
};

export const informationAdminApi = {
  async notices(params?: Record<string, string>) { const { data } = await apiClient.get<R<InformationNotice[]>>("/admin/information/notices", { params }); return data.data; },
  async createNotice(body: Partial<InformationNotice>) { const { data } = await apiClient.post<R<InformationNotice>>("/admin/information/notices", cleanNotice(body)); return data.data; },
  async updateNotice(id: string, body: Partial<InformationNotice>) { const { data } = await apiClient.patch<R<InformationNotice>>(`/admin/information/notices/${id}`, cleanNotice(body)); return data.data; },
  async guides(params?: Record<string, string>) { const { data } = await apiClient.get<R<GuideArticle[]>>("/admin/information/guides", { params }); return data.data; },
  async createGuide(body: Partial<GuideArticle>) { const { data } = await apiClient.post<R<GuideArticle>>("/admin/information/guides", cleanGuide(body)); return data.data; },
  async updateGuide(id: string, body: Partial<GuideArticle>) { const { data } = await apiClient.patch<R<GuideArticle>>(`/admin/information/guides/${id}`, cleanGuide(body)); return data.data; },
};

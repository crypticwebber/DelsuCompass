import { apiClient } from "@/services/api/axios";import type { SafetyAlert,SafetyReport,SafetyReportInput } from "./safety.types";
type R<T>={success:true;data:T;message?:string};
export const safetyApi={async alerts(params:Record<string,string|undefined>={}){const{data}=await apiClient.get<R<SafetyAlert[]>>("/safety/alerts",{params});return data.data},async mine(){const{data}=await apiClient.get<R<SafetyReport[]>>("/safety/reports/mine");return data.data},async report(input:SafetyReportInput){const{data}=await apiClient.post<R<SafetyReport>>("/safety/reports",input);return data.data}};

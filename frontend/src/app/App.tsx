import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { PageLoading } from "@/components/feedback/PageLoading";
import { router } from "@/routes";

export default function App() {
  return <Suspense fallback={<PageLoading />}><RouterProvider router={router} /></Suspense>;
}

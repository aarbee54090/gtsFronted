"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { AdminMainProduct, ApiItemResponse } from "@/lib/admin-types";
import { MainProductForm, type MainProductFormValues } from "@/components/admin/MainProductForm";

export default function NewMainProductPage() {
  const router = useRouter();

  async function handleSubmit(values: MainProductFormValues) {
    await apiFetch<ApiItemResponse<AdminMainProduct>>("/main-products", {
      method: "POST",
      requireAdmin: true,
      body: values,
    });
    router.push("/admin/main-products");
  }

  return (
    <div>
      <Link
        href="/admin/main-products"
        className="mb-4 inline-block text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
      >
        ← Back to Main Products
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-white">Add Main Product</h1>

      <MainProductForm
        submitLabel="Create Main Product"
        submittingLabel="Saving..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}

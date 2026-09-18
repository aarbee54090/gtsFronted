"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import type { AdminMainProduct, ApiItemResponse } from "@/lib/admin-types";
import {
  MainProductForm,
  type MainProductFormValues,
  type MainProductFormInitialValues,
} from "@/components/admin/MainProductForm";

export default function EditMainProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<MainProductFormInitialValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiItemResponse<AdminMainProduct>>(`/main-products/${params.id}`, { requireAdmin: true })
      .then((res) => {
        setInitialValues({
          name: res.data.name,
          thumbnailImageUrl: res.data.thumbnailImageUrl,
          thumbnailImageUrlMobile: res.data.thumbnailImageUrlMobile,
          description: res.data.description,
          isActive: res.data.isActive,
        });
      })
      .catch((err: ApiError) => setLoadError(err.message));
  }, [params.id]);

  async function handleSubmit(values: MainProductFormValues) {
    await apiFetch<ApiItemResponse<AdminMainProduct>>(`/main-products/${params.id}`, {
      method: "PUT",
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
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Main Product</h1>

      {loadError && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {loadError}
        </p>
      )}

      {!loadError && !initialValues && (
        <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>
      )}

      {initialValues && (
        <MainProductForm
          initialValues={initialValues}
          submitLabel="Save Changes"
          submittingLabel="Saving..."
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

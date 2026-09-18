"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import type { AdminProduct, ApiItemResponse } from "@/lib/admin-types";
import { ProductForm, type ProductFormValues, type ProductFormInitialValues } from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<ProductFormInitialValues | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiItemResponse<AdminProduct>>(`/products/${params.id}`)
      .then((res) => {
        setInitialValues({
          name: res.data.name,
          category: res.data.category,
          sport: res.data.sport,
          thumbnailImageUrl: res.data.thumbnailImageUrl,
          thumbnailImageUrlMobile: res.data.thumbnailImageUrlMobile,
          designs: res.data.designs.map((d) => ({ name: d.name, imageUrl: d.imageUrl, price: d.price })),
          pricingTiers: (res.data.pricingTiers ?? []).map((t) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            price: t.price,
          })),
        });
      })
      .catch((err: ApiError) => setLoadError(err.message));
  }, [params.id]);

  async function handleSubmit(values: ProductFormValues) {
    await apiFetch<ApiItemResponse<AdminProduct>>(`/products/${params.id}`, {
      method: "PUT",
      requireAdmin: true,
      body: values,
    });
    router.push("/admin/products");
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-block text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-brand-green)]"
      >
        ← Back to Products
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Product</h1>

      {loadError && (
        <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {loadError}
        </p>
      )}

      {!loadError && !initialValues && (
        <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>
      )}

      {initialValues && (
        <ProductForm
          initialValues={initialValues}
          submitLabel="Save Changes"
          submittingLabel="Saving..."
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

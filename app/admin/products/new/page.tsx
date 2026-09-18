"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { AdminProduct, ApiItemResponse } from "@/lib/admin-types";
import { ProductForm, type ProductFormValues } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  async function handleSubmit(values: ProductFormValues) {
    await apiFetch<ApiItemResponse<AdminProduct>>("/products", {
      method: "POST",
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
      <h1 className="mb-6 text-2xl font-bold text-white">Add Product</h1>

      <ProductForm
        submitLabel="Create Product"
        submittingLabel="Saving..."
        onSubmit={handleSubmit}
      />
    </div>
  );
}

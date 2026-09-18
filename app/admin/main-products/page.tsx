"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import type { AdminMainProduct, ApiListResponse } from "@/lib/admin-types";

export default function AdminMainProductsPage() {
  const [mainProducts, setMainProducts] = useState<AdminMainProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiListResponse<AdminMainProduct>>("/main-products/admin", { requireAdmin: true })
      .then((res) => setMainProducts(res.data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(mainProduct: AdminMainProduct) {
    const confirmed = window.confirm(`Delete "${mainProduct.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(mainProduct._id);
    try {
      await apiFetch(`/main-products/${mainProduct._id}`, { method: "DELETE", requireAdmin: true });
      setMainProducts((prev) => prev.filter((p) => p._id !== mainProduct._id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete main product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Main Products</h1>
        <Link
          href="/admin/main-products/new"
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2.5 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:-translate-y-0.5"
        >
          + Add Main Product
        </Link>
      </div>
      <p className="mb-6 text-xs text-[var(--color-text-gray)]">
        Top-level product lines (Jersey, Hoodie, Tracksuit) shown on the /products landing
        page - separate from the sport-specific sub-products under Products.
      </p>

      {loading && <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>}

      {error && (
        <p className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      {!loading && mainProducts.length === 0 && !error && (
        <p className="text-sm text-[var(--color-text-gray)]">
          No main products yet. Create one to get started.
        </p>
      )}

      {!loading && mainProducts.length > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--glass-border)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 text-[var(--color-text-gray)]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mainProducts.map((mainProduct) => (
                <tr key={mainProduct._id} className="border-b border-[var(--glass-border)] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-white">{mainProduct.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        mainProduct.isActive
                          ? "bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)]"
                          : "bg-white/10 text-[var(--color-text-gray)]"
                      }`}
                    >
                      {mainProduct.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/main-products/${mainProduct._id}/edit`}
                        className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(mainProduct)}
                        disabled={deletingId === mainProduct._id}
                        className="text-xs font-semibold text-[var(--color-error-red)] hover:underline disabled:opacity-40"
                      >
                        {deletingId === mainProduct._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

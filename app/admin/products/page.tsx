"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import type { AdminProduct, ApiListResponse } from "@/lib/admin-types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiListResponse<AdminProduct>>("/products")
      .then((res) => setProducts(res.data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(`Delete "${product.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(product._id);
    try {
      await apiFetch(`/products/${product._id}`, { method: "DELETE", requireAdmin: true });
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2.5 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:-translate-y-0.5"
        >
          + Add Product
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>}

      {error && (
        <p className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      {!loading && products.length === 0 && !error && (
        <p className="text-sm text-[var(--color-text-gray)]">
          No products yet. Create one to get started.
        </p>
      )}

      {!loading && products.length > 0 && (
        <div className="flex flex-col gap-3 sm:hidden">
          {products.map((product) => (
            <div
              key={product._id}
              className="rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-4"
            >
              <p className="font-semibold text-white">{product.name}</p>
              <p className="mt-1 text-xs text-[var(--color-text-gray)]">
                {product.category} · {product.sport} · {product.designs?.length ?? 0} designs
              </p>
              <div className="mt-3 flex gap-3">
                <Link
                  href={`/admin/products/${product._id}/edit`}
                  className="flex-1 rounded-[var(--radius-pill)] border border-[var(--color-brand-green)] py-2 text-center text-sm font-semibold text-[var(--color-brand-green)]"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product._id}
                  className="flex-1 rounded-[var(--radius-pill)] border border-[var(--color-error-red)] py-2 text-sm font-semibold text-[var(--color-error-red)] disabled:opacity-40"
                >
                  {deletingId === product._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--glass-border)] sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 text-[var(--color-text-gray)]">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Sport</th>
                <th className="px-4 py-3 font-semibold">Designs</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-[var(--glass-border)] last:border-b-0">
                  <td className="px-4 py-3 font-medium text-white">{product.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-gray)]">{product.category}</td>
                  <td className="px-4 py-3 text-[var(--color-text-gray)]">{product.sport}</td>
                  <td className="px-4 py-3 text-[var(--color-text-gray)]">{product.designs?.length ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/products/${product._id}/edit`}
                        className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product._id}
                        className="text-xs font-semibold text-[var(--color-error-red)] hover:underline disabled:opacity-40"
                      >
                        {deletingId === product._id ? "Deleting..." : "Delete"}
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

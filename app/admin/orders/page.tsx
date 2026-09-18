"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { apiFetch, apiFetchBlobUrl, ApiError } from "@/lib/api";
import type { AdminOrder, AdminOrderFile, ApiListResponse } from "@/lib/admin-types";

const STATUS_STYLES: Record<AdminOrder["status"], string> = {
  pending: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  approved: "text-[var(--color-brand-green)] border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/10",
  rejected: "text-[var(--color-error-red)] border-[var(--color-error-red)]/40 bg-[var(--color-error-red)]/10",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{ label: string; url: string } | null>(null);
  const [previewLoadingKey, setPreviewLoadingKey] = useState<string | null>(null);

  async function viewReceipt(order: AdminOrder) {
    setPreviewLoadingKey(`receipt-${order._id}`);
    try {
      const url = await apiFetchBlobUrl(`/orders/admin/${order._id}/receipt`, { requireAdmin: true });
      setPreviewModal({ label: `${order.orderId} — Receipt`, url });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load receipt.");
    } finally {
      setPreviewLoadingKey(null);
    }
  }

  async function viewAdditionalFile(order: AdminOrder, file: AdminOrderFile) {
    setPreviewLoadingKey(`file-${file._id}`);
    try {
      const url = await apiFetchBlobUrl(
        `/orders/admin/${order._id}/additional-file/${file._id}`,
        { requireAdmin: true }
      );
      setPreviewModal({ label: file.filename, url });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load file.");
    } finally {
      setPreviewLoadingKey(null);
    }
  }

  function closePreviewModal() {
    if (previewModal) URL.revokeObjectURL(previewModal.url);
    setPreviewModal(null);
  }

  useEffect(() => {
    apiFetch<ApiListResponse<AdminOrder>>("/orders/admin/all", { requireAdmin: true })
      .then((res) => setOrders(res.data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(order: AdminOrder, status: "approved" | "rejected") {
    setUpdatingId(order._id);
    try {
      await apiFetch(`/orders/admin/${order._id}/status`, {
        method: "PATCH",
        requireAdmin: true,
        body: { status },
      });
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status } : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update order.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Orders</h1>

      {loading && <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>}

      {error && (
        <p className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      {!loading && orders.length === 0 && !error && (
        <p className="text-sm text-[var(--color-text-gray)]">No orders yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-gray)]">
                  {order.orderId}
                </p>
                <p className="text-lg font-bold text-white">
                  {order.productName} — {order.sport}
                </p>
                <p className="text-sm text-[var(--color-text-gray)]">
                  {order.contact.name} · {order.contact.phone}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLES[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-xs text-[var(--color-text-gray)]">Design</p>
                <div className="mt-1 flex items-center gap-2">
                  {order.designImageUrl && (
                    <Image
                      src={order.designImageUrl}
                      alt={order.designName}
                      width={40}
                      height={52}
                      unoptimized={order.designImageUrl.startsWith("data:")}
                      className="h-13 w-10 rounded-[var(--radius-sm)] object-cover"
                    />
                  )}
                  <span className="text-white">{order.designName}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-gray)]">Quantity</p>
                <p className="text-white">{order.quantity}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-gray)]">Total</p>
                <p className="font-bold text-white">
                  {order.priceBreakdown.currency}
                  {order.priceBreakdown.total}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-gray)]">Advance / Balance</p>
                <p className="text-white">
                  {order.priceBreakdown.currency}
                  {order.advanceAmount} / {order.priceBreakdown.currency}
                  {order.balanceAmount}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-gray)]">Receipt</p>
                <button
                  type="button"
                  onClick={() => viewReceipt(order)}
                  disabled={previewLoadingKey === `receipt-${order._id}`}
                  className="text-[var(--color-brand-green)] hover:underline disabled:opacity-50"
                >
                  {previewLoadingKey === `receipt-${order._id}` ? "Loading..." : "View screenshot"}
                </button>
              </div>
            </div>

            {order.players.length > 0 && (
              <div className="border-t border-[var(--glass-border)] pt-3">
                <p className="mb-2 text-xs text-[var(--color-text-gray)]">
                  Player Details ({order.players.length})
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-xs">
                    <thead>
                      <tr className="text-[var(--color-text-gray)]">
                        <th className="pb-1 pr-3">Name</th>
                        <th className="pb-1 pr-3">Number</th>
                        <th className="pb-1 pr-3">Size</th>
                        <th className="pb-1 pr-3">Sleeve</th>
                        <th className="pb-1 pr-3">Neck</th>
                        <th className="pb-1 pr-3">Shorts/Track</th>
                        <th className="pb-1">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.players.map((p, i) => (
                        <tr key={i} className="text-white">
                          <td className="py-1 pr-3">{p.name}</td>
                          <td className="py-1 pr-3">{p.number}</td>
                          <td className="py-1 pr-3">{p.size}</td>
                          <td className="py-1 pr-3">{p.sleeveType}</td>
                          <td className="py-1 pr-3">{p.neckType}</td>
                          <td className="py-1 pr-3">{p.shortsTrack}</td>
                          <td className="py-1">{p.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {order.additionalFiles.length > 0 && (
              <div className="border-t border-[var(--glass-border)] pt-3">
                <p className="mb-2 text-xs text-[var(--color-text-gray)]">
                  Additional Files ({order.additionalFiles.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {order.additionalFiles.map((file) => (
                    <button
                      key={file._id}
                      type="button"
                      onClick={() => viewAdditionalFile(order, file)}
                      disabled={previewLoadingKey === `file-${file._id}`}
                      className="rounded-[var(--radius-sm)] border border-[var(--glass-border)] px-3 py-1.5 text-xs text-white hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)] disabled:opacity-50"
                    >
                      {previewLoadingKey === `file-${file._id}` ? "Loading..." : file.filename}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {order.status === "pending" && (
              <div className="flex gap-3 border-t border-[var(--glass-border)] pt-3">
                <button
                  onClick={() => updateStatus(order, "approved")}
                  disabled={updatingId === order._id}
                  className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(order, "rejected")}
                  disabled={updatingId === order._id}
                  className="rounded-[var(--radius-pill)] border border-[var(--color-error-red)] px-5 py-2 text-sm font-bold text-[var(--color-error-red)] disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {previewModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={previewModal.label}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closePreviewModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-lg flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)] p-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{previewModal.label}</h3>
              <button
                type="button"
                onClick={closePreviewModal}
                aria-label="Close"
                className="text-[var(--color-text-gray)] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Image
              src={previewModal.url}
              alt={previewModal.label}
              width={500}
              height={640}
              unoptimized
              className="max-h-[65vh] w-full rounded-[var(--radius-md)] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

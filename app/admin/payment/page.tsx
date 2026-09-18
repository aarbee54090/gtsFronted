"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { PaymentConfig, PaymentMethod, PaymentMethodType, ApiItemResponse } from "@/lib/admin-types";

const inputClasses =
  "rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[var(--color-brand-green)] focus:outline-none";

// Controlled-input row shape - detail fields kept as plain strings, same
// pattern as ProductForm's design/pricing-tier rows.
interface MethodRow {
  type: PaymentMethodType;
  label: string;
  qrCodeImageUrl: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  ifsc: string;
  upiId: string;
}

const emptyRow: MethodRow = {
  type: "esewa",
  label: "",
  qrCodeImageUrl: "",
  accountName: "",
  accountNumber: "",
  bankName: "",
  branch: "",
  ifsc: "",
  upiId: "",
};

function toRow(method: PaymentMethod): MethodRow {
  return {
    type: method.type,
    label: method.label,
    qrCodeImageUrl: method.qrCodeImageUrl,
    accountName: method.details?.accountName ?? "",
    accountNumber: method.details?.accountNumber ?? "",
    bankName: method.details?.bankName ?? "",
    branch: method.details?.branch ?? "",
    ifsc: method.details?.ifsc ?? "",
    upiId: method.details?.upiId ?? "",
  };
}

export default function AdminPaymentPage() {
  const [methods, setMethods] = useState<MethodRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiItemResponse<PaymentConfig>>("/payment-config")
      .then((res) => {
        const rows = (res.data.methods ?? []).map(toRow);
        setMethods(rows.length > 0 ? rows : [{ ...emptyRow }]);
      })
      .catch(() => {
        // No config set up yet - start with one blank row.
        setMethods([{ ...emptyRow }]);
      })
      .finally(() => setLoading(false));
  }, []);

  function updateMethod(index: number, field: keyof MethodRow, value: string) {
    setMethods((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function addMethodRow() {
    setMethods((prev) => [...prev, { ...emptyRow }]);
  }

  function removeMethodRow(index: number) {
    setMethods((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = methods
        .filter((m) => m.label && m.qrCodeImageUrl)
        .map((m) => ({
          type: m.type,
          label: m.label,
          qrCodeImageUrl: m.qrCodeImageUrl,
          details: {
            accountName: m.accountName || undefined,
            accountNumber: m.accountNumber || undefined,
            bankName: m.bankName || undefined,
            branch: m.branch || undefined,
            ifsc: m.ifsc || undefined,
            upiId: m.upiId || undefined,
          },
        }));

      await apiFetch("/payment-config", {
        method: "PUT",
        requireAdmin: true,
        body: { methods: payload },
      });
      setMessage("Payment settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Payment Settings</h1>

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Payment Methods</span>
          <button
            type="button"
            onClick={addMethodRow}
            className="text-xs font-semibold text-[var(--color-brand-green)] hover:underline"
          >
            + Add Payment Method
          </button>
        </div>

        {methods.map((method, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] p-4">
            <div className="flex items-start gap-2">
              <select
                value={method.type}
                onChange={(e) => updateMethod(index, "type", e.target.value)}
                aria-label="Payment method type"
                className={`w-32 ${inputClasses}`}
              >
                <option value="esewa">eSewa</option>
                <option value="khalti">Khalti</option>
                <option value="bank">Bank</option>
                <option value="other">Other</option>
              </select>
              <input
                value={method.label}
                onChange={(e) => updateMethod(index, "label", e.target.value)}
                placeholder="Label shown to customer, e.g. Nabil Bank"
                className={`flex-1 ${inputClasses}`}
              />
              {methods.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMethodRow(index)}
                  aria-label="Remove payment method"
                  className="rounded-[var(--radius-sm)] border border-[var(--glass-border)] px-3 py-2 text-sm text-[var(--color-error-red)] hover:border-[var(--color-error-red)]"
                >
                  ✕
                </button>
              )}
            </div>

            <input
              value={method.qrCodeImageUrl}
              onChange={(e) => updateMethod(index, "qrCodeImageUrl", e.target.value)}
              placeholder="QR code image URL (https://res.cloudinary.com/...)"
              className={inputClasses}
            />

            <span className="text-xs font-semibold text-[var(--color-text-gray)]">
              Details (optional — mainly for Bank)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <input
                value={method.accountName}
                onChange={(e) => updateMethod(index, "accountName", e.target.value)}
                placeholder="Account Name"
                className={inputClasses}
              />
              <input
                value={method.accountNumber}
                onChange={(e) => updateMethod(index, "accountNumber", e.target.value)}
                placeholder="Account Number"
                className={inputClasses}
              />
              <input
                value={method.bankName}
                onChange={(e) => updateMethod(index, "bankName", e.target.value)}
                placeholder="Bank Name"
                className={inputClasses}
              />
              <input
                value={method.branch}
                onChange={(e) => updateMethod(index, "branch", e.target.value)}
                placeholder="Branch"
                className={inputClasses}
              />
              <input
                value={method.ifsc}
                onChange={(e) => updateMethod(index, "ifsc", e.target.value)}
                placeholder="IFSC / SWIFT"
                className={inputClasses}
              />
              <input
                value={method.upiId}
                onChange={(e) => updateMethod(index, "upiId", e.target.value)}
                placeholder="UPI ID"
                className={inputClasses}
              />
            </div>
          </div>
        ))}

        {error && (
          <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-[var(--radius-md)] border border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 px-4 py-3 text-sm text-[var(--color-brand-green)]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save Payment Settings"}
        </button>
      </form>
    </div>
  );
}

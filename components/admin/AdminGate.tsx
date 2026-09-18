"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminKey, setAdminKey, clearAdminKey, verifyAdminKey } from "@/lib/api";

type GateState = "checking" | "denied" | "granted";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [gateState, setGateState] = useState<GateState>("checking");
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Deliberate exception to react-hooks/set-state-in-effect: localStorage
    // and the backend can only be checked after mount. A saved key might be
    // stale/wrong (e.g. saved before this verification existed), so it's
    // re-checked against the backend every time, not just trusted because
    // it exists.
    const existingKey = getAdminKey();
    if (!existingKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGateState("denied");
      return;
    }
    verifyAdminKey(existingKey).then((valid) => {
      if (valid) {
        setGateState("granted");
      } else {
        clearAdminKey();
        setGateState("denied");
      }
    });
  }, []);

  async function handleSaveKey(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);

    const valid = await verifyAdminKey(trimmed);

    if (valid) {
      setAdminKey(trimmed);
      setGateState("granted");
    } else {
      setError("Access Denied — that key is not correct.");
    }
    setSubmitting(false);
  }

  function handleChangeKey() {
    clearAdminKey();
    setInputValue("");
    setError(null);
    setGateState("denied");
  }

  if (gateState === "checking") {
    return <div className="min-h-screen bg-[var(--color-bg-dark)]" />;
  }

  if (gateState === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-dark)] px-6">
        <form
          onSubmit={handleSaveKey}
          className="flex w-full max-w-sm flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-8 backdrop-blur-[16px]"
        >
          <h1 className="text-lg font-bold text-white">Admin Access</h1>
          <p className="text-sm text-[var(--color-text-gray)]">
            Enter the admin key to manage products and catalog items.
          </p>
          <input
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Admin key"
            autoFocus
            className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
          />
          {error && (
            <p className="rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-3 text-sm font-bold text-[var(--color-bg-dark)] transition-transform hover:enabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-dark)] text-white">
      <header className="sticky top-0 z-10 border-b border-[var(--glass-border)] bg-[var(--color-bg-dark)]/90 backdrop-blur-[16px]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin" className="font-bold text-white">
              GTS Admin
            </Link>
          </nav>
          <button
            onClick={handleChangeKey}
            className="text-xs font-semibold text-[var(--color-text-gray)] hover:text-[var(--color-error-red)]"
          >
            Change Key
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-6 py-10">{children}</main>
    </div>
  );
}

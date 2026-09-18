"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  adminDeleteAvailability,
  adminListAppointments,
  adminSetAvailability,
  adminUpdateAppointmentStatus,
  getAvailability,
} from "@/lib/api";
import type { Appointment, AppointmentStatus, Availability } from "@/lib/appointment-types";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  approved: "text-[var(--color-brand-green)] border-[var(--color-brand-green)]/40 bg-[var(--color-brand-green)]/10",
  rejected: "text-[var(--color-error-red)] border-[var(--color-error-red)]/40 bg-[var(--color-error-red)]/10",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminAppointmentsPage() {
  const [availability, setAvailabilityList] = useState<Availability[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"available" | "day_off">("available");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([getAvailability(), adminListAppointments()])
      .then(([availabilityRes, appointmentsRes]) => {
        setAvailabilityList(availabilityRes);
        setAppointments(appointmentsRes);
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Failed to load appointments."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSaveAvailability(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!date) {
      setFormError("Pick a date.");
      return;
    }
    if (status === "available" && (!startTime || !endTime)) {
      setFormError("Set a start and end time.");
      return;
    }
    if (status === "available" && startTime >= endTime) {
      setFormError("Start time must be before end time.");
      return;
    }

    setSaving(true);
    try {
      await adminSetAvailability({
        date,
        status,
        startTime: status === "available" ? startTime : undefined,
        endTime: status === "available" ? endTime : undefined,
      });
      setDate("");
      setStartTime("");
      setEndTime("");
      setStatus("available");
      loadAll();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to save availability.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAvailability(entry: Availability) {
    try {
      await adminDeleteAvailability(entry._id);
      setAvailabilityList((prev) => prev.filter((a) => a._id !== entry._id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete availability.");
    }
  }

  async function updateStatus(appointment: Appointment, next: "approved" | "rejected") {
    setUpdatingId(appointment._id);
    try {
      await adminUpdateAppointmentStatus(appointment._id, next);
      setAppointments((prev) => prev.map((a) => (a._id === appointment._id ? { ...a, status: next } : a)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update appointment.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">Appointments</h1>

      {error && (
        <p className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-error-red)] bg-[var(--color-error-red)]/10 px-4 py-3 text-sm text-[var(--color-error-red)]">
          {error}
        </p>
      )}

      <section className="mb-10 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5">
        <h2 className="mb-4 text-lg font-bold text-white">Set Availability</h2>
        <form onSubmit={handleSaveAvailability} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-[var(--color-text-gray)]">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="radio"
                name="status"
                checked={status === "available"}
                onChange={() => setStatus("available")}
              />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="radio" name="status" checked={status === "day_off"} onChange={() => setStatus("day_off")} />
              Day Off
            </label>
          </div>

          {status === "available" && (
            <>
              <div>
                <label className="mb-1 block text-xs text-[var(--color-text-gray)]">From</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--color-text-gray)]">To</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm text-white focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-6 py-2 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
        {formError && <p className="mt-3 text-sm text-[var(--color-error-red)]">{formError}</p>}

        {!loading && availability.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            {availability.map((entry) => (
              <div
                key={entry._id}
                className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--glass-border)] px-4 py-2 text-sm"
              >
                <span className="text-white">{formatDate(entry.date)}</span>
                <span className="text-[var(--color-text-gray)]">
                  {entry.status === "available" ? `${entry.startTime} – ${entry.endTime}` : "Day Off"}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteAvailability(entry)}
                  className="text-xs text-[var(--color-error-red)] hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-white">Booking Requests</h2>

        {loading && <p className="text-sm text-[var(--color-text-gray)]">Loading...</p>}
        {!loading && appointments.length === 0 && (
          <p className="text-sm text-[var(--color-text-gray)]">No requests yet.</p>
        )}

        <div className="flex flex-col gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--glass-border)] bg-[var(--color-card-dark)]/60 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-white">
                    {formatDate(appointment.date)} at {appointment.time}
                  </p>
                  <p className="text-sm text-[var(--color-text-gray)]">
                    {appointment.name} · {appointment.phone}
                  </p>
                  {appointment.note && (
                    <p className="text-sm text-[var(--color-text-gray)]">Note: {appointment.note}</p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLES[appointment.status]}`}
                >
                  {appointment.status}
                </span>
              </div>

              {appointment.status === "pending" && (
                <div className="flex gap-3 border-t border-[var(--glass-border)] pt-3">
                  <button
                    onClick={() => updateStatus(appointment, "approved")}
                    disabled={updatingId === appointment._id}
                    className="rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-5 py-2 text-sm font-bold text-[var(--color-bg-dark)] disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(appointment, "rejected")}
                    disabled={updatingId === appointment._id}
                    className="rounded-[var(--radius-pill)] border border-[var(--color-error-red)] px-5 py-2 text-sm font-bold text-[var(--color-error-red)] disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { Upload, Plus, X } from "lucide-react"
import type { PlayerRow } from "@/lib/types"

interface PlayerDetailsFormProps {
  players: PlayerRow[]
  onChange: (players: PlayerRow[]) => void
  sleeveOptions: string[]
  neckOptions: string[]
  addonOptions: string[]
  /** When true, skips its own legend/button row - used when a parent renders a combined header instead. */
  hideHeader?: boolean
}

export interface PlayerDetailsFormHandle {
  /** Opens the native Excel file picker - used by a parent's combined header button. */
  openExcelPicker: () => void
  /** Adds a blank player row - used by a parent's combined header button. */
  addRow: () => void
  /** Parses a spreadsheet File directly (routed here from a shared "Upload files" input) and appends player rows. */
  importExcelFile: (file: File) => Promise<void>
}

const inputClasses =
  "w-full rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20 px-2 py-1.5 text-xs text-white focus:border-[var(--color-brand-green)] focus:outline-none"

function emptyRow(): PlayerRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    number: "",
    size: "",
    sleeveType: "",
    neckType: "",
    shortsTrack: "",
    note: "",
  }
}

// Matches a column header from an uploaded Excel sheet to our field names,
// tolerant of casing/spacing since admins/customers won't type these exactly.
function normalizeHeader(header: string): keyof Omit<PlayerRow, "id"> | null {
  const key = header.trim().toLowerCase().replace(/[^a-z]/g, "")
  if (key.includes("name")) return "name"
  if (key.includes("number")) return "number"
  if (key.includes("size")) return "size"
  if (key.includes("sleeve")) return "sleeveType"
  if (key.includes("neck") || key.includes("collar")) return "neckType"
  if (key.includes("short") || key.includes("track")) return "shortsTrack"
  if (key.includes("note")) return "note"
  return null
}

export const PlayerDetailsForm = forwardRef<PlayerDetailsFormHandle, PlayerDetailsFormProps>(
  function PlayerDetailsForm({ players, onChange, sleeveOptions, neckOptions, addonOptions, hideHeader }, ref) {
    const fileInput = useRef<HTMLInputElement>(null)

    function updateRow(id: string, field: keyof Omit<PlayerRow, "id">, value: string) {
      onChange(players.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    }

    function addRow() {
      onChange([...players, emptyRow()])
    }

    function removeRow(id: string) {
      onChange(players.filter((p) => p.id !== id))
    }

    async function handleExcelUpload(file: File) {
      // Requires the "xlsx" package - run `npm install xlsx` if this throws.
      const XLSX = await import("xlsx")
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "array" })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet)

      const parsed: PlayerRow[] = rows.map((row) => {
        const player = emptyRow()
        for (const [header, value] of Object.entries(row)) {
          const field = normalizeHeader(header)
          if (field) player[field] = String(value ?? "")
        }
        return player
      })

      onChange([...players, ...parsed])
    }

    useImperativeHandle(ref, () => ({
      openExcelPicker: () => fileInput.current?.click(),
      addRow,
      importExcelFile: handleExcelUpload,
    }))

    return (
      <fieldset className="flex flex-col gap-3">
        {!hideHeader && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <legend className="text-sm font-semibold text-white">Player Details (optional)</legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload Excel
              </button>
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-brand-green)] px-3 py-1.5 text-xs font-bold text-[var(--color-bg-dark)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Player
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileInput}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleExcelUpload(file)
            e.target.value = ""
          }}
        />
        {!hideHeader && (
          <p className="text-xs text-[var(--color-text-gray)]">
            Optional - doesn&apos;t affect quantity or pricing. Useful for name/number printing and per-player sizing.
          </p>
        )}

      {players.length > 0 && (
        <>
          {/* Mobile: stacked cards, one per player */}
          <div className="flex flex-col gap-3 sm:hidden">
            {players.map((player, i) => (
              <div
                key={player.id}
                className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-black/20 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--color-text-gray)]">
                    Player {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(player.id)}
                    aria-label={`Remove player row ${player.name || i + 1}`}
                    className="text-[var(--color-text-gray)] hover:text-[var(--color-error-red)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
                    Name
                    <input
                      value={player.name}
                      onChange={(e) => updateRow(player.id, "name", e.target.value)}
                      className={inputClasses}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
                    Number
                    <input
                      value={player.number}
                      onChange={(e) => updateRow(player.id, "number", e.target.value)}
                      className={inputClasses}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
                    Size
                    <input
                      value={player.size}
                      onChange={(e) => updateRow(player.id, "size", e.target.value)}
                      placeholder="M"
                      className={inputClasses}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
                    Sleeve Type
                    <select
                      value={player.sleeveType}
                      onChange={(e) => updateRow(player.id, "sleeveType", e.target.value)}
                      className={inputClasses}
                    >
                      <option value="" className="bg-[var(--color-card-dark)] text-white">—</option>
                      {sleeveOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[var(--color-card-dark)] text-white">{opt}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
                    Neck Type
                    <select
                      value={player.neckType}
                      onChange={(e) => updateRow(player.id, "neckType", e.target.value)}
                      className={inputClasses}
                    >
                      <option value="" className="bg-[var(--color-card-dark)] text-white">—</option>
                      {neckOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[var(--color-card-dark)] text-white">{opt}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
                    Shorts/Track
                    <select
                      value={player.shortsTrack}
                      onChange={(e) => updateRow(player.id, "shortsTrack", e.target.value)}
                      className={inputClasses}
                    >
                      <option value="" className="bg-[var(--color-card-dark)] text-white">—</option>
                      {addonOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-[var(--color-card-dark)] text-white">{opt}</option>
                      ))}
                    </select>
                  </label>
                  <label className="col-span-2 flex flex-col gap-1 text-xs text-[var(--color-text-gray)]">
                    Note
                    <input
                      value={player.note}
                      onChange={(e) => updateRow(player.id, "note", e.target.value)}
                      className={inputClasses}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* sm and up: full table */}
          <div className="hidden overflow-x-auto rounded-[var(--radius-md)] border border-[var(--glass-border)] sm:block">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--glass-border)] text-[var(--color-text-gray)]">
                  <th className="p-2">Name</th>
                  <th className="p-2">Number</th>
                  <th className="p-2">Size</th>
                  <th className="p-2">Sleeve Type</th>
                  <th className="p-2">Neck Type</th>
                  <th className="p-2">Shorts/Track</th>
                  <th className="p-2">Note</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player.id} className="border-b border-[var(--glass-border)] last:border-0">
                    <td className="p-2">
                      <input
                        value={player.name}
                        onChange={(e) => updateRow(player.id, "name", e.target.value)}
                        className={inputClasses}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={player.number}
                        onChange={(e) => updateRow(player.id, "number", e.target.value)}
                        className={inputClasses}
                      />
                    </td>
                    <td className="p-2">
                      <input
                        value={player.size}
                        onChange={(e) => updateRow(player.id, "size", e.target.value)}
                        placeholder="M"
                        className={inputClasses}
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={player.sleeveType}
                        onChange={(e) => updateRow(player.id, "sleeveType", e.target.value)}
                        className={inputClasses}
                      >
                        <option value="" className="bg-[var(--color-card-dark)] text-white">—</option>
                        {sleeveOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-[var(--color-card-dark)] text-white">{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        value={player.neckType}
                        onChange={(e) => updateRow(player.id, "neckType", e.target.value)}
                        className={inputClasses}
                      >
                        <option value="" className="bg-[var(--color-card-dark)] text-white">—</option>
                        {neckOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-[var(--color-card-dark)] text-white">{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <select
                        value={player.shortsTrack}
                        onChange={(e) => updateRow(player.id, "shortsTrack", e.target.value)}
                        className={inputClasses}
                      >
                        <option value="" className="bg-[var(--color-card-dark)] text-white">—</option>
                        {addonOptions.map((opt) => (
                          <option key={opt} value={opt} className="bg-[var(--color-card-dark)] text-white">{opt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        value={player.note}
                        onChange={(e) => updateRow(player.id, "note", e.target.value)}
                        className={inputClasses}
                      />
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => removeRow(player.id)}
                        aria-label={`Remove player row ${player.name || players.indexOf(player) + 1}`}
                        className="text-[var(--color-text-gray)] hover:text-[var(--color-error-red)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </fieldset>
  )
  }
)

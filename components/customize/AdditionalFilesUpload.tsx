"use client"

import { forwardRef, useImperativeHandle, useRef } from "react"
import { Upload, X, FileImage } from "lucide-react"

interface AdditionalFilesUploadProps {
  files: File[]
  onChange: (files: File[]) => void
  /** When true, skips its own legend/button row - used when a parent renders a combined header instead. */
  hideHeader?: boolean
  /**
   * Optional hook run on newly picked files before they're added to the
   * attachment list - lets a parent reroute certain files elsewhere (e.g.
   * spreadsheets to a player-import parser) and only keep the rest here.
   */
  onFilesPicked?: (files: File[]) => File[]
}

export interface AdditionalFilesUploadHandle {
  /** Opens the native file picker - used by a parent's combined "Upload files" button. */
  openFilePicker: () => void
}

export const AdditionalFilesUpload = forwardRef<AdditionalFilesUploadHandle, AdditionalFilesUploadProps>(
  function AdditionalFilesUpload({ files, onChange, hideHeader, onFilesPicked }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(ref, () => ({
      openFilePicker: () => inputRef.current?.click(),
    }))

    function handleFilesSelected(fileList: FileList | null) {
      if (!fileList) return
      const picked = onFilesPicked ? onFilesPicked(Array.from(fileList)) : Array.from(fileList)
      if (picked.length > 0) onChange([...files, ...picked])
    }

    function removeFile(index: number) {
      onChange(files.filter((_, i) => i !== index))
    }

    return (
      <fieldset className="flex flex-col gap-3">
        {!hideHeader && (
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-white">Logo / Additional Files</legend>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--glass-border)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload files
            </button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFilesSelected(e.target.files)
            e.target.value = "" // allow re-selecting the same file later
          }}
        />
        {!hideHeader && (
          <p className="text-xs text-[var(--color-text-gray)]">
            Team logos, sponsor logos, player detail sheets, or any reference file for your order. Any file type accepted.
          </p>
        )}

        {files.length > 0 && (
          <ul className="flex flex-col gap-2">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--glass-border)] bg-black/20 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 truncate text-white">
                  <FileImage className="h-4 w-4 shrink-0 text-[var(--color-text-gray)]" />
                  <span className="truncate">{file.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 text-[var(--color-text-gray)] hover:text-[var(--color-error-red)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    )
  }
)

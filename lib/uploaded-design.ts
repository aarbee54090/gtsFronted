const UPLOADED_DESIGN_KEY = "gts_uploaded_design_image"

export function saveUploadedDesignImage(dataUrl: string) {
  sessionStorage.setItem(UPLOADED_DESIGN_KEY, dataUrl)
}

export function loadUploadedDesignImage(): string | null {
  return sessionStorage.getItem(UPLOADED_DESIGN_KEY)
}

export function clearUploadedDesignImage() {
  sessionStorage.removeItem(UPLOADED_DESIGN_KEY)
}

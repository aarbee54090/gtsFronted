export interface AdminAddonStyle {
  _id: string
  label: string
  price: number
  imageUrl?: string
  description?: string
}

export interface AdminAddon {
  _id: string
  name: string
  styles: AdminAddonStyle[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

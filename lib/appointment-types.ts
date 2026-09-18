export type AppointmentStatus = "pending" | "approved" | "rejected"

export interface Availability {
  _id: string
  date: string
  status: "available" | "day_off"
  startTime?: string
  endTime?: string
}

export interface Appointment {
  _id: string
  date: string
  time: string
  name: string
  phone: string
  note?: string
  status: AppointmentStatus
  adminNotes?: string
  createdAt: string
}

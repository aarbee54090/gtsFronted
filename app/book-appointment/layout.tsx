import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Sportswear Appointment | GTS",
  description: "Schedule a visit to discuss fabric, fit, and design for your team's custom sportswear order with GTS.",
};

export default function BookAppointmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}

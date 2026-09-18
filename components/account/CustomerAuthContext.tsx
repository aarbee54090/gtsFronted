"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { apiFetch, ApiError } from "@/lib/api"
import type { Customer } from "@/lib/customer-types"

interface CustomerAuthContextValue {
  customer: Customer | null
  loading: boolean // still checking the session on first load
  register: (data: { name: string; phone: string; address: string }) => Promise<void>
  login: (phone: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch<{ success: boolean; data: Customer }>("/customers/me")
      setCustomer(res.data)
    } catch {
      setCustomer(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const register = useCallback(
    async (data: { name: string; phone: string; address: string }) => {
      const res = await apiFetch<{ success: boolean; data: Customer }>("/customers/register", {
        method: "POST",
        body: data,
      })
      setCustomer(res.data)
    },
    []
  )

  const login = useCallback(async (phone: string) => {
    const res = await apiFetch<{ success: boolean; data: Customer }>("/customers/login", {
      method: "POST",
      body: { phone },
    })
    setCustomer(res.data)
  }, [])

  const logout = useCallback(async () => {
    await apiFetch("/customers/logout", { method: "POST" }).catch(() => {})
    setCustomer(null)
  }, [])

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, register, login, logout, refresh }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error("useCustomerAuth must be used within a CustomerAuthProvider")
  return ctx
}

export { ApiError }

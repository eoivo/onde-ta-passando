"use client"

import { useEffect } from "react"
import { useLoadingStore } from "@/store/loading-store"

export default function LoadingReset() {
  const { setLoading } = useLoadingStore()

  useEffect(() => {
    setLoading(false)
  }, [setLoading])

  return null
}

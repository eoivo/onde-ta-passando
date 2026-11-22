"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  currentFilters: Record<string, string | undefined>
}

export default function Pagination({ currentPage, totalPages, baseUrl, currentFilters }: PaginationProps) {
  const router = useRouter()
  const isMobile = useMobile()

  if (totalPages <= 1) {
    return null
  }

  const navigateToPage = (page: number) => {
    const params = new URLSearchParams()

    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value)
      }
    })

    if (page > 1) {
      params.set("page", page.toString())
    }

    router.push(`${baseUrl}?${params.toString()}`)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = isMobile ? 3 : 5

    pageNumbers.push(1)

    const startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3)

    if (startPage > 2) {
      pageNumbers.push("...")
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push("...")
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <div className="flex justify-center items-center mt-10 gap-1.5 md:gap-2">
      <button
        type="button"
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        {!isMobile && <span>Anterior</span>}
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-neutral-500 text-xs">
              ...
            </span>
          )
        }

        const isActive = currentPage === page
        return (
          <button
            type="button"
            key={`page-${page}`}
            onClick={() => navigateToPage(Number(page))}
            className={`h-10 min-w-[40px] px-3 rounded-full text-xs font-bold inline-flex items-center justify-center transition-colors cursor-pointer ${
              isActive
                ? "bg-red-600 border border-red-500 text-white"
                : "bg-white/[0.04] border border-white/10 text-neutral-300 hover:bg-white/[0.1] hover:border-white/25 hover:text-white"
            }`}
          >
            {page}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
        className="h-10 px-4 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.1] hover:border-white/25 text-neutral-200 hover:text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
      >
        {!isMobile && <span>Próximo</span>}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

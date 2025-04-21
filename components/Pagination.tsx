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
    <div className="flex justify-center items-center mt-8 gap-1 md:gap-2">
      <Button
        variant="outline"
        size={isMobile ? "icon" : "default"}
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Anterior</span>}
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
              ...
            </span>
          )
        }

        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => navigateToPage(Number(page))}
            className={currentPage === page ? "bg-primary" : ""}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size={isMobile ? "icon" : "default"}
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {!isMobile && <span className="mr-1">Próximo</span>}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

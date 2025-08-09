'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

export interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  showItemsPerPage?: boolean
  showPageJump?: boolean
  showPageInfo?: boolean
  className?: string
  pageSizeOptions?: number[]
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageJump = true,
  showPageInfo = true,
  className = '',
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  const [jumpToPage, setJumpToPage] = useState('')

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const handleJumpToPage = () => {
    const pageNum = parseInt(jumpToPage)
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum)
      setJumpToPage('')
    } else {
      toast.error(`请输入1到${totalPages}之间的页码`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToPage()
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        if (totalPages > 5) {
          pages.push('...')
          pages.push(totalPages)
        }
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div
      className={`flex items-center justify-between text-xs text-gray-500 ${className}`}
    >
      {showPageInfo && <span>共 {totalItems} 条记录</span>}

      <div className="flex items-center gap-4">
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span>每页显示</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value))
                onPageChange(1)
              }}
              className="px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>条</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(1)}
            className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === 1}
            title="第一页"
          >
            首页
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === 1}
            title="上一页"
          >
            上一页
          </button>

          <div className="flex items-center gap-1">
            {renderPageNumbers().map((page, index) => (
              <span key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => goToPage(page as number)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </span>
            ))}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === totalPages}
            title="下一页"
          >
            下一页
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            className="px-2 py-1 rounded bg-gray-700/50 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === totalPages}
            title="最后一页"
          >
            末页
          </button>
        </div>

        {showPageJump && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-600">
            <span className="text-xs text-gray-400">跳转到:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={jumpToPage}
              onChange={(e) => setJumpToPage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-16 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-xs text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              placeholder="页码"
            />
            <button
              onClick={handleJumpToPage}
              className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded hover:bg-blue-500/30 transition-colors"
              title="跳转"
            >
              跳转
            </button>
          </div>
        )}

        {showPageInfo && (
          <span className="text-gray-400">
            {startIndex + 1}-{endIndex} / {totalItems}
          </span>
        )}
      </div>
    </div>
  )
}

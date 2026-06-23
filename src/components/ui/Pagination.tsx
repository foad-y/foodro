import { ChevronRight, ChevronLeft } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * A reusable pagination component with orange theme styling,
 * designed to work with Persian (RTL) layouts.
 *
 * Features:
 * - Previous/Next buttons with chevron icons
 * - Smart page number display with ellipsis for large page counts
 * - Active page highlighted with orange-amber gradient
 * - Numbers formatted in Persian (fa-IR)
 * - Disabled state for first/last page boundaries
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-between mt-6 px-2">
      <div className="text-sm text-gray-500">
        صفحه {currentPage.toLocaleString("fa-IR")} از{" "}
        {totalPages.toLocaleString("fa-IR")}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded-lg border border-border text-primary hover:bg-gradiantbtnto/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {generatePageNumbers(currentPage, totalPages).map((p, idx) => {
          if (p === "ellipsis") {
            return (
              <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
                ...
              </span>
            );
          }
          return (
            <button
              key={p}
              onClick={() => handlePageChange(p as number)}
              className={`min-w-9 h-9 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                currentPage === p
                  ? "bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white shadow-md"
                  : "text-gray-600 hover:bg-gradiantbtnto/15 border border-border"
              }`}
            >
              {(p as number).toLocaleString("fa-IR")}
            </button>
          );
        })}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-lg border border-border text-primary hover:bg-gradiantbtnto/15 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Generates an array of page numbers and ellipsis markers for smart display.
 *
 * Rules:
 * - If 7 or fewer pages: show all
 * - Otherwise: show first, last, and pages around current ±1
 * - Gaps are filled with "ellipsis" strings
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  // Always include first page
  pages.push(1);

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  // Pages around current
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  // Always include last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}
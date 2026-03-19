import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
}) => {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === "ar";
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Show max 5 page numbers
    let visiblePages = pages;
    if (totalPages > 5) {
        if (currentPage <= 3) {
            visiblePages = [...pages.slice(0, 5)];
        } else if (currentPage >= totalPages - 2) {
            visiblePages = [...pages.slice(totalPages - 5)];
        } else {
            visiblePages = [...pages.slice(currentPage - 3, currentPage + 2)];
        }
    }

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 w-full animate-in fade-in">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                {totalItems} <span className="uppercase opacity-75">Items</span>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isRtl ? (
                        <ChevronRight size={18} />
                    ) : (
                        <ChevronLeft size={18} />
                    )}
                </button>

                {visiblePages[0] > 1 && (
                    <span className="text-slate-400 px-1 font-bold">...</span>
                )}

                {visiblePages.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm transition-all duration-300 ${
                            currentPage === page
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105"
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {visiblePages[visiblePages.length - 1] < totalPages && (
                    <span className="text-slate-400 px-1 font-bold">...</span>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isRtl ? (
                        <ChevronLeft size={18} />
                    ) : (
                        <ChevronRight size={18} />
                    )}
                </button>
            </div>
        </div>
    );
};

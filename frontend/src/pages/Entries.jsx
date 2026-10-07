import { useState, useMemo } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Filter, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { formatPaise, friendlyDate, cn } from "../lib/utils";
import { useApp } from "../context/AppContext";
import AddEntryModal from "../components/AddEntryModal";
import TransferModal from "../components/TransferModal";

export default function Entries() {
  const { selectedAccount } = useApp();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const fetchEntries = async ({ pageParam = null }) => {
    let url = `/entries?account=${selectedAccount._id}&limit=30`;
    if (tab !== "all") url += `&type=${tab}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (pageParam) url += `&cursor=${pageParam}`;
    return API.get(url);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["entries", selectedAccount?._id, tab, search],
      queryFn: fetchEntries,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!selectedAccount?._id,
    });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/entries/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Deleted", {
        action: { label: "Undo", onClick: () => restoreMutation.mutate(id) },
      });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => API.post(`/entries/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Restored");
    },
  });

  const entries = useMemo(
    () => data?.pages.flatMap((p) => p.items) || [],
    [data],
  );

  const grouped = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const d = entry.date;
      if (!acc[d]) acc[d] = [];
      acc[d].push(entry);
      return acc;
    }, {});
  }, [entries]);

  const handleEdit = (entry) => {
    setEditItem(entry);
    if (entry.type === "transfer") setShowTransferModal(true);
    else setShowEntryModal(true);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Sticky header */}
      <div className="sticky top-16 z-30 -mx-4 px-4 sm:mx-0 sm:px-0 pb-3 pt-1 bg-gray-50/95 dark:bg-zinc-950/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Timeline
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2.5 rounded-xl transition border",
              showFilters || search
                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 border-gray-200 dark:border-zinc-800 shadow-sm",
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-gray-200/70 dark:bg-zinc-800/80 p-1 rounded-xl w-full">
          {["all", "income", "expense", "transfer"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                tab === t
                  ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center p-10 text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
          No entries found.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateStr, items]) => (
            <div key={dateStr} className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest pl-2">
                {friendlyDate(dateStr)}{" "}
                <span className="font-normal lowercase ml-1">
                  ({format(parseISO(dateStr), "dd MMM yyyy")})
                </span>
              </h3>

              <div className="card overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
                {items.map((entry) => {
                  const isTransfer = entry.type === "transfer";
                  let title = entry.head?.name || "Uncategorized";
                  if (isTransfer) {
                    const counterName = entry.transferToAccount?.name || "Self";
                    title = entry.isOutgoing
                      ? `To ${counterName}`
                      : `From ${counterName}`;
                  }

                  return (
                    <div
                      key={entry._id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0",
                            isTransfer
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                              : entry.type === "income"
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
                                : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300",
                          )}
                        >
                          {isTransfer
                            ? "⇄"
                            : entry.head?.emoji ||
                              (entry.type === "income" ? "↗" : "↘")}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-zinc-100 text-sm truncate">
                            {title}
                          </p>
                          {entry.summary && (
                            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                              {entry.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
                            <span
                              className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                entry.mode === "cash"
                                  ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                                  : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
                              )}
                            >
                              {entry.mode === "cash" ? "CASH" : "ONLINE"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <span
                          className={cn(
                            "font-bold text-sm",
                            isTransfer
                              ? entry.isOutgoing
                                ? "text-gray-900 dark:text-zinc-100"
                                : "text-emerald-600 dark:text-emerald-400"
                              : entry.type === "income"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400",
                          )}
                        >
                          {(entry.type === "expense" ||
                          (isTransfer && entry.isOutgoing)
                            ? "-"
                            : "+") + formatPaise(entry.amountPaise)}
                        </span>

                        <div className="flex items-center gap-1 mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(entry._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition"
            >
              {isFetchingNextPage ? "Loading..." : "Load More Entries"}
            </button>
          )}
        </div>
      )}

      {showEntryModal && (
        <AddEntryModal
          isOpen={showEntryModal}
          onClose={() => {
            setShowEntryModal(false);
            setEditItem(null);
          }}
          editEntry={editItem}
        />
      )}
      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setEditItem(null);
          }}
          editEntry={editItem}
        />
      )}
    </div>
  );
}

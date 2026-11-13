import { useEffect, useMemo, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Loader2, Plus, Receipt, Search, X } from "lucide-react";
import { toast } from "sonner";
import API from "../lib/api";
import { formatPaise, friendlyDate, cn } from "../lib/utils";
import { useApp } from "../context/AppContext";
import AddEntryModal from "../components/AddEntryModal";
import TransferModal from "../components/TransferModal";
import EntryRow, { entryMeta } from "../components/EntryRow";
import EmptyState from "../components/ui/EmptyState";
import { EntryListSkeleton } from "../components/ui/Skeleton";
import { openAddEntry } from "../lib/quickActions";

const TABS = [
  { value: "all", label: "All" },
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
  { value: "transfer", label: "Transfers" },
];

export default function Entries() {
  const { selectedAccount } = useApp();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (event.key === "/" && !/input|textarea|select/i.test(event.target.tagName)) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const fetchEntries = async ({ pageParam = null }) => {
    let url = `/entries?account=${selectedAccount._id}&limit=30`;
    if (tab !== "all") url += `&type=${tab}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (pageParam) url += `&cursor=${pageParam}`;
    return API.get(url);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
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
      toast.success("Entry deleted", {
        action: { label: "Undo", onClick: () => restoreMutation.mutate(id) },
      });
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => API.post(`/entries/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Entry restored");
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });

  const entries = useMemo(
    () => data?.pages.flatMap((page) => page.items) || [],
    [data],
  );

  const grouped = useMemo(() => {
    return entries.reduce((accumulator, entry) => {
      if (!accumulator[entry.date]) accumulator[entry.date] = [];
      accumulator[entry.date].push(entry);
      return accumulator;
    }, {});
  }, [entries]);

  const totals = useMemo(
    () =>
      entries.reduce(
        (accumulator, entry) => {
          const { isIncoming, isTransfer } = entryMeta(entry);
          if (isTransfer) return accumulator;
          if (isIncoming) accumulator.in += entry.amountPaise;
          else accumulator.out += entry.amountPaise;
          return accumulator;
        },
        { in: 0, out: 0 },
      ),
    [entries],
  );

  const openEdit = (entry) => {
    if (entry.type === "loan") {
      toast.info("Manage loan entries from the Loans page.");
      return;
    }
    if (entry.type === "transfer") {
      const counterId =
        entry.transferToAccount?._id || entry.transferToAccount;
      if (
        !entry.isOutgoing &&
        counterId &&
        String(counterId) !== String(selectedAccount?._id)
      ) {
        toast.info(
          "This money came from another account — edit the transfer there.",
        );
        return;
      }
    }
    setEditItem(entry);
    if (entry.type === "transfer") setShowTransferModal(true);
    else setShowEntryModal(true);
  };

  const isFiltering = tab !== "all" || Boolean(search);

  return (
    <div className="space-y-4 pb-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-label">Activity</p>
          <h1 className="page-title mt-1">Transactions</h1>
        </div>
        <button onClick={openAddEntry} className="btn-primary btn-sm">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add entry
        </button>
      </div>

      {/* Search + filters */}
      <div className="sticky top-16 z-30 -mx-4 space-y-2.5 border-b border-slate-200/60 bg-slate-50/95 px-4 pb-3 pt-1 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/95 sm:mx-0 sm:rounded-2xl sm:border-0 sm:px-0">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            ref={searchRef}
            type="search"
            aria-label="Search entries by note"
            placeholder="Search notes…   (press /)"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="input pl-9 pr-9"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {TABS.map((option) => (
            <button
              key={option.value}
              onClick={() => setTab(option.value)}
              aria-pressed={tab === option.value}
              className="chip"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <EntryListSkeleton rows={6} />
      ) : isError ? (
        <div className="card card-body text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Couldn’t load transactions
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {error?.message}
          </p>
          <button onClick={() => refetch()} className="btn-primary btn-sm mx-auto mt-4">
            Try again
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={isFiltering ? Search : Receipt}
            title={isFiltering ? "No matching entries" : "No entries yet"}
            description={
              isFiltering
                ? "Try a different search term or clear the filters to see everything."
                : "Every income and expense you add will appear here, grouped by day."
            }
            action={
              isFiltering ? (
                <button
                  onClick={() => {
                    setTab("all");
                    setSearchInput("");
                  }}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
              ) : (
                <button onClick={openAddEntry} className="btn-primary">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add your first entry
                </button>
              )
            }
          />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            <span>
              {entries.length}
              {hasNextPage ? "+" : ""} {entries.length === 1 ? "entry" : "entries"}
              {search && ` matching “${search}”`}
            </span>
            <span className={cn("flex items-center gap-3", tab === "transfer" && "hidden")}>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                In {formatPaise(totals.in)}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Out {formatPaise(totals.out)}
              </span>
            </span>
          </div>

          <div className="space-y-5">
            {Object.entries(grouped).map(([dateStr, items]) => {
              const dayNet = items.reduce((sum, entry) => {
                const { isIncoming, isTransfer } = entryMeta(entry);
                if (isTransfer) return sum;
                return sum + (isIncoming ? entry.amountPaise : -entry.amountPaise);
              }, 0);

              return (
                <section key={dateStr} aria-label={friendlyDate(dateStr)}>
                  <div className="mb-1.5 flex items-baseline justify-between px-1">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                      {friendlyDate(dateStr)}
                      <span className="ml-1.5 font-medium normal-case tracking-normal text-slate-400 dark:text-zinc-500">
                        {format(parseISO(dateStr), "d MMM yyyy")}
                      </span>
                    </h2>
                    <span
                      className={cn(
                        "money text-[11px] font-bold",
                        dayNet >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-500 dark:text-zinc-400",
                      )}
                    >
                      {dayNet >= 0 ? "+" : "−"}
                      {formatPaise(Math.abs(dayNet))}
                    </span>
                  </div>

                  <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-zinc-800">
                    {items.map((entry) => (
                      <EntryRow
                        key={entry._id}
                        entry={entry}
                        showActions
                        readOnly={entry.type === "loan"}
                        onEdit={openEdit}
                        onDelete={(item) => deleteMutation.mutate(item._id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="btn-secondary w-full"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Loading…
                </>
              ) : (
                "Load more entries"
              )}
            </button>
          )}
        </>
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

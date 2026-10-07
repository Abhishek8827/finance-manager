import { useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../lib/api";
import { useApp } from "../context/AppContext";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => API.get("/accounts"),
  });
}

export function useHeads() {
  const { selectedAccount } = useApp();
  return useQuery({
    queryKey: ["heads", selectedAccount?._id],
    queryFn: () => API.get(`/heads?account=${selectedAccount._id}`),
    enabled: !!selectedAccount?._id,
  });
}

export function useInvalidateData() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["entries"] });
    qc.invalidateQueries({ queryKey: ["summary"] });
    qc.invalidateQueries({ queryKey: ["loans"] });
    qc.invalidateQueries({ queryKey: ["heads"] });
  };
}

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import API from "../lib/api";
import { toast } from "sonner";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setError(null);
    try {
      const data = await API.get("/accounts");
      if (!data || data.length === 0) {
        setAccounts([]);
        setSelectedAccount(null);
        return;
      }
      setAccounts(data);
      const saved = localStorage.getItem("selectedAccountId");
      const found = data.find((a) => a._id === saved);
      if (found) {
        setSelectedAccount(found);
      } else if (data[0]) {
        setSelectedAccount(data[0]);
        localStorage.setItem("selectedAccountId", data[0]._id);
      }
    } catch (e) {
      setError(e.message || "Failed to connect to server");
      toast.error(
        "Connection error: " + (e.message || "Server not responding"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHeads = useCallback(async (accountId) => {
    if (!accountId) return;
    try {
      const data = await API.get(`/heads?account=${accountId}`);
      setHeads(data || []);
    } catch (e) {
      console.error("Failed to fetch heads:", e);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    if (selectedAccount?._id) fetchHeads(selectedAccount._id);
  }, [selectedAccount, fetchHeads]);

  const switchAccount = (acc) => {
    setSelectedAccount(acc);
    localStorage.setItem("selectedAccountId", acc._id);
  };

  const createAccount = async (name) => {
    try {
      const acc = await API.post("/accounts", { name });
      setAccounts((p) => [...p, acc]);
      toast.success("Account created");
      return acc;
    } catch (e) {
      toast.error(e.message);
    }
  };

  const renameAccount = async (id, name) => {
    try {
      const acc = await API.put(`/accounts/${id}`, { name });
      setAccounts((p) => p.map((a) => (a._id === id ? acc : a)));
      if (selectedAccount?._id === id) setSelectedAccount(acc);
      toast.success("Renamed");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const createHead = async (name, type) => {
    if (!selectedAccount) return null;
    try {
      const h = await API.post("/heads", {
        account: selectedAccount._id,
        name,
        type,
      });
      setHeads((p) => [...p, h]);
      toast.success("Category created");
      return h;
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        accounts,
        selectedAccount,
        switchAccount,
        createAccount,
        renameAccount,
        heads,
        createHead,
        fetchHeads,
        loading,
        error,
        retry: fetchAccounts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

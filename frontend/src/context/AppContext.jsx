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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    const data = await API.get("/accounts");
    setAccounts(data);
    const saved = localStorage.getItem("selectedAccountId");
    const found = data.find((account) => account._id === saved);
    if (found) setSelectedAccount(found);
    else if (data[0]) {
      setSelectedAccount(data[0]);
      localStorage.setItem("selectedAccountId", data[0]._id);
    } else {
      setSelectedAccount(null);
    }
    return data;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await fetchAccounts();
      setLoadError(null);
    } catch (error) {
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, [fetchAccounts]);

  useEffect(() => {
    load();
  }, [load]);

  const switchAccount = (account) => {
    setSelectedAccount(account);
    localStorage.setItem("selectedAccountId", account._id);
  };

  const createAccount = async (name) => {
    const account = await API.post("/accounts", { name });
    setAccounts((current) => [...current, account]);
    setSelectedAccount(account);
    localStorage.setItem("selectedAccountId", account._id);
    toast.success("Account created");
    return account;
  };

  const renameAccount = async (id, name) => {
    const updated = await API.put(`/accounts/${id}`, { name });
    setAccounts((previous) =>
      previous.map((account) => (account._id === id ? updated : account)),
    );
    if (selectedAccount?._id === id) setSelectedAccount(updated);
    toast.success("Account renamed");
    return updated;
  };

  const refreshAccounts = async () => {
    try {
      await fetchAccounts();
    } catch {
      // Keep the current selection if a background refresh fails.
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
        refreshAccounts,
        loading,
        loadError,
        reload: load,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

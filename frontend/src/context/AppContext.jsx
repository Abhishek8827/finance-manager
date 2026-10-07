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

  const fetchAccounts = useCallback(async () => {
    const data = await API.get("/accounts");
    setAccounts(data);
    const saved = localStorage.getItem("selectedAccountId");
    const found = data.find((a) => a._id === saved);
    if (found) setSelectedAccount(found);
    else if (data[0]) {
      setSelectedAccount(data[0]);
      localStorage.setItem("selectedAccountId", data[0]._id);
    }
  }, []);

  const fetchHeads = useCallback(async (accountId) => {
    if (!accountId) return;
    const data = await API.get(`/heads?account=${accountId}`);
    setHeads(data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await fetchAccounts();
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchAccounts]);

  useEffect(() => {
    if (selectedAccount?._id) fetchHeads(selectedAccount._id);
  }, [selectedAccount, fetchHeads]);

  const switchAccount = (acc) => {
    setSelectedAccount(acc);
    localStorage.setItem("selectedAccountId", acc._id);
  };

  const createAccount = async (name) => {
    const acc = await API.post("/accounts", { name });
    setAccounts((p) => [...p, acc]);
    toast.success("Account created");
    return acc;
  };

  const renameAccount = async (id, name) => {
    const acc = await API.put(`/accounts/${id}`, { name });
    setAccounts((p) => p.map((a) => (a._id === id ? acc : a)));
    if (selectedAccount?._id === id) setSelectedAccount(acc);
    toast.success("Renamed");
  };

  const createHead = async (name, type) => {
    if (!selectedAccount) return null;
    const h = await API.post("/heads", {
      account: selectedAccount._id,
      name,
      type,
    });
    setHeads((p) => [...p, h]);
    toast.success("Category created");
    return h;
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

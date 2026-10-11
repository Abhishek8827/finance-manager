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

  return (
    <AppContext.Provider
      value={{
        accounts,
        selectedAccount,
        switchAccount,
        createAccount,
        renameAccount,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

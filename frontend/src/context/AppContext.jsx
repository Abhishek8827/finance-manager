import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import API, { setAccessToken } from "../lib/api";
import { toast } from "sonner";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const queryClient = useQueryClient();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const login = useCallback(
    async (password) => {
      setLoading(true);
      try {
        const { token } = await API.post("/auth/login", { password });
        setAccessToken(token);
        await fetchAccounts();
        setAuthenticated(true);
      } catch (error) {
        setAccessToken(null);
        setAccounts([]);
        setSelectedAccount(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccounts],
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    setAuthenticated(false);
    setAccounts([]);
    setSelectedAccount(null);
    localStorage.removeItem("selectedAccountId");
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    const handleExpired = () => {
      logout();
      toast.error("Your session expired. Unlock the app to continue.");
    };
    window.addEventListener("finance-manager:auth-expired", handleExpired);
    return () =>
      window.removeEventListener("finance-manager:auth-expired", handleExpired);
  }, [logout]);

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
        authenticated,
        login,
        logout,
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

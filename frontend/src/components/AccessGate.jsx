import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AccessGate() {
  const { login, loading } = useApp();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await login(password);
      setPassword("");
    } catch (loginError) {
      setError(loginError.message || "Unable to unlock the app.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-sm p-6 space-y-5"
        aria-labelledby="access-title"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <LockKeyhole aria-hidden="true" />
          </div>
          <div>
            <h1 id="access-title" className="text-lg font-bold">
              Finance Manager
            </h1>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Enter your access password to continue.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="app-password" className="block text-sm font-medium mb-1.5">
            Access password
          </label>
          <input
            id="app-password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Unlocking…" : "Unlock app"}
        </button>
      </form>
    </main>
  );
}

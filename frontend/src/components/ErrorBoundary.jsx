import { Component } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keeps the crash visible in the console for debugging.
    console.error("Finance Manager crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
          <div className="card w-full max-w-sm p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-zinc-400">
              The screen hit an unexpected error. Your data is safe — reload to
              continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mt-5 w-full"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
              Reload the app
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

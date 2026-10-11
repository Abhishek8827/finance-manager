import { lazy, Suspense, useEffect, useRef, useState } from "react";

const SummaryCharts = lazy(() => import("./SummaryCharts"));

function ChartPlaceholder() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {["Expenses by Category", "6-Month Trend"].map((title) => (
        <div className="card p-5" key={title}>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4">
            {title}
          </h3>
          <div className="h-60 animate-pulse rounded-xl bg-gray-100 dark:bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

export default function DeferredSummaryCharts(props) {
  const containerRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    if (isNearViewport) return;
    if (!("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isNearViewport]);

  return (
    <div ref={containerRef}>
      {isNearViewport ? (
        <Suspense fallback={<ChartPlaceholder />}>
          <SummaryCharts {...props} />
        </Suspense>
      ) : (
        <ChartPlaceholder />
      )}
    </div>
  );
}

import { lazy, Suspense, useEffect, useRef, useState } from "react";

const SummaryCharts = lazy(() => import("./SummaryCharts"));

function ChartPlaceholder() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {["Spending by category", "Income vs spending"].map((title) => (
        <div className="card card-body" key={title}>
          <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <div className="skeleton h-56 w-full rounded-xl" aria-hidden="true" />
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
      { rootMargin: "240px 0px" },
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

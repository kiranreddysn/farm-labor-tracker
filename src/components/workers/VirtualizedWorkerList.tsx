import { useRef, useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { WorkerCard } from "./WorkerCard";
import type { Worker } from "./WorkerCard";

interface VirtualizedWorkerListProps {
  workers: Worker[];
  onLogShift: (workerId: string) => void;
  onRecordPayment: (workerId: string) => void;
  onEditWorker: (workerId: string) => void;
  onViewHistory: (workerId: string) => void;
  onDeleteWorker?: (workerId: string) => void;
}

export function VirtualizedWorkerList({
  workers,
  onLogShift,
  onRecordPayment,
  onEditWorker,
  onViewHistory,
  onDeleteWorker,
}: VirtualizedWorkerListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Add window resize listener to update cards per row
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate how many cards per row based on viewport width
  const getCardsPerRow = () => {
    if (typeof window === "undefined") return 3; // Default for SSR
    const width = window.innerWidth;
    if (width < 640) return 1; // Mobile: 1 card
    if (width < 1024) return 2; // Tablet: 2 cards
    if (width < 1280) return 3; // Small desktop: 3 cards
    return 3; // Large desktop: 3 cards
  };

  const cardsPerRow = getCardsPerRow();
  const rowHeight = 220; // Height of a row including padding

  // Group workers into rows
  const rows = [];
  for (let i = 0; i < workers.length; i += cardsPerRow) {
    rows.push(workers.slice(i, i + cardsPerRow));
  }

  // Set up virtualizer for rows instead of individual cards
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(workers.length / cardsPerRow),
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{
        height: `600px`,
        width: `100%`,
        overflow: "auto",
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = virtualRow.index;
          const rowWorkers = workers.slice(
            rowIndex * cardsPerRow,
            (rowIndex + 1) * cardsPerRow,
          );

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                padding: "8px",
              }}
            >
              {rowWorkers.map((worker) => (
                <div key={worker.id} className="flex-1 min-w-[300px]">
                  <WorkerCard
                    worker={worker}
                    onLogShift={onLogShift}
                    onRecordPayment={onRecordPayment}
                    onEditWorker={onEditWorker}
                    onViewHistory={onViewHistory}
                    onDeleteWorker={onDeleteWorker}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

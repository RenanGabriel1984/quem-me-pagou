import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

export function PullToRefresh({ onRefresh, children, threshold = 80 }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [offset, setOffset] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setOffset(Math.min(diff * 0.4, threshold));
    }
  }, [pulling, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (offset >= threshold * 0.8) {
      setOffset(50);
      await onRefresh();
    }
    setOffset(0);
  }, [pulling, offset, threshold, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="flex justify-center py-3 transition-opacity"
        style={{
          height: `${offset}px`,
          opacity: offset > 0 ? 1 : 0,
          transform: `translateY(-${Math.max(0, 50 - offset)}px)`,
        }}
      >
        <RefreshCw
          className={`size-5 text-primary ${offset > 0 ? "animate-spin" : ""}`}
        />
      </div>
      <div
        style={{
          transform: `translateY(${offset > 0 ? offset : 0}px)`,
          transition: offset === 0 ? "transform 0.3s ease" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}

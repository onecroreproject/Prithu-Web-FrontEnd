// src/components/VirtualizedFeed.jsx
import React, { useRef } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";

export default function VirtualizedFeed({
  items = [],
  overscan = 3,
  renderItem,
}) {
  const parentRef = useRef(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => 600, // default height estimation, dynamic will override
    overscan,
    scrollMargin: 200,
  });

  return (
    <div ref={parentRef}>
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              ref={virtualRow.measureElement}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: "20px",
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

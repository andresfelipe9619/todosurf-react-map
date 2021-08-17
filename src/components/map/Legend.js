import React from "react";
const gradients = ["#67cc39", "#d6e429", "#f74609"];

export default function Legend({ max, min }) {
  const mid = max / 2 + min;
  const ranges = [min, mid, max];

  return (
    <div className="legend">
      {ranges.map((x, i) => (
        <span key={x} className="legend-item">
          <i style={{ background: gradients[i] }} />
          {Number(x).toFixed(2)} m
        </span>
      ))}
    </div>
  );
}

import React from "react";

export default function Legend({ max, min }) {
  const mid = max / 2 + min;
  const ranges = [min, mid, max];

  return (
    <div className="padding">
      <h4>Wave's Legend</h4>
      <div className="legend-container">
        <div className="gradient" />
        <div className="legend">
          {ranges.map((x) => (
            <span key={x} className="legend-item">
              {Number(x).toFixed(2)} m
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

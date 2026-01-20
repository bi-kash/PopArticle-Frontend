import React from "react";

export default function DebugPanel({ error, onClear }) {
  if (!error) return null;

  const content = typeof error === "string" ? { message: error } : error;

  return (
    <div
      className="card"
      style={{ marginBottom: "1rem", background: "#fff7f0" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong style={{ color: "#7a2e0e" }}>Debug Info</strong>
        <div>
          <button className="btn btn-secondary" onClick={onClear}>
            Close
          </button>
        </div>
      </div>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          marginTop: "0.5rem",
          color: "#3b2b1a",
        }}
      >
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}

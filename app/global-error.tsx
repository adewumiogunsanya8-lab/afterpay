"use client";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Store temporarily unavailable | AfterPay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f9fc",
          color: "#0a0e18",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: 520, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#2563eb", fontSize: 12, fontWeight: 700, letterSpacing: ".18em" }}>
            AFTERPAY
          </p>
          <h1 style={{ fontSize: 32, letterSpacing: "-.03em" }}>The store is temporarily unavailable</h1>
          <p style={{ color: "#4d5670", lineHeight: 1.6 }}>
            A temporary issue interrupted this page. Please retry, or return to the store.
          </p>
          {error.digest ? (
            <p style={{ color: "#6b7590", fontSize: 12 }}>Reference: {error.digest}</p>
          ) : null}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={retry}
              style={{
                border: 0,
                borderRadius: 999,
                padding: "12px 20px",
                background: "#2563eb",
                color: "white",
                cursor: "pointer",
                font: "inherit",
                fontWeight: 600,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #dfe3ee",
                borderRadius: 999,
                padding: "12px 20px",
                background: "white",
                color: "#151a29",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Go to the store
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

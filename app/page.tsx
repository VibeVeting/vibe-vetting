export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Vibe Vetting</h1>
      <p>Welcome to the Vibe Vetting foundation site.</p>
      <div style={{ marginTop: "2rem" }}>
        <h2>Features:</h2>
        <ul>
          <li>Next.js with App Router</li>
          <li>TypeScript support</li>
          <li>MongoDB connection configured</li>
        </ul>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <a 
          href="/api/test-db" 
          style={{ 
            padding: "0.5rem 1rem", 
            background: "#0070f3", 
            color: "white", 
            textDecoration: "none",
            borderRadius: "0.25rem",
            display: "inline-block"
          }}
        >
          Test MongoDB Connection
        </a>
      </div>
    </main>
  );
}

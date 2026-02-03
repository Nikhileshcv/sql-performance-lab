const API_BASE = import.meta.env.VITE_API_URL;

export async function runQuery(
  scenarioId: string,
  variant: "slow" | "optimized"
) {
  const res = await fetch(`${API_BASE}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioId, variant })
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  return res.json();
}

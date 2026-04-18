import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getLowStock,
  getSalesSummary,
} from "../api/reports";
import type { DashboardSummary, SalesSummary, StockAlert } from "../types/api";

export default function ReportsPage() {
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(s?: string, e?: string) {
    setLoading(true);
    setError(null);
    try {
      const [dash, low, sum] = await Promise.all([
        getDashboardSummary(),
        getLowStock(),
        getSalesSummary(s || undefined, e || undefined),
      ]);
      setDashboard(dash);
      setAlerts(low);
      setSummary(sum);
    } catch {
      setError("Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reportes</h1>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {/* KPI Cards */}
          {dashboard && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <KpiCard
                label="Insumos bajo mínimo"
                value={dashboard.low_stock_ingredients}
                warn={dashboard.low_stock_ingredients > 0}
              />
              <KpiCard
                label="Productos bajo mínimo"
                value={dashboard.low_stock_products}
                warn={dashboard.low_stock_products > 0}
              />
              <KpiCard
                label="Ventas este mes"
                value={dashboard.sales_this_month}
              />
              <KpiCard
                label="Ingresos este mes"
                value={`$${dashboard.revenue_this_month.toFixed(2)}`}
              />
            </div>
          )}

          {/* Sales summary with date filter */}
          <section style={{ marginBottom: "2rem" }}>
            <h2>Resumen de ventas</h2>
            <div
              style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}
            >
              <label>
                Desde
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label>
                Hasta
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
              <button
                className="btn btn-primary"
                style={{ alignSelf: "flex-end" }}
                onClick={() => void load(start, end)}
              >
                Filtrar
              </button>
            </div>
            {summary && (
              <table className="table" style={{ maxWidth: 500 }}>
                <tbody>
                  <tr>
                    <th>Período</th>
                    <td>
                      {summary.period_start} → {summary.period_end}
                    </td>
                  </tr>
                  <tr>
                    <th>Total ventas</th>
                    <td>{summary.total_sales}</td>
                  </tr>
                  <tr>
                    <th>Ingresos</th>
                    <td>${summary.total_revenue.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </section>

          {/* Stock alerts */}
          <section>
            <h2>Alertas de stock</h2>
            {alerts.length === 0 ? (
              <p style={{ color: "var(--color-success)" }}>
                Todo el stock está dentro de los mínimos.
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Nombre</th>
                    <th>Stock actual</th>
                    <th>Mínimo</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={`${a.kind}-${a.id}`}>
                      <td>
                        <span
                          className={
                            a.kind === "ingredient"
                              ? "badge badge-warning"
                              : "badge badge-danger"
                          }
                        >
                          {a.kind === "ingredient" ? "Insumo" : "Producto"}
                        </span>
                      </td>
                      <td>{a.name}</td>
                      <td>{a.stock}</td>
                      <td>{a.min_stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  warn,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: `1px solid ${warn ? "var(--color-danger)" : "var(--color-border)"}`,
        borderRadius: 8,
        padding: "1rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          margin: 0,
          color: warn ? "var(--color-danger)" : "var(--color-text)",
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

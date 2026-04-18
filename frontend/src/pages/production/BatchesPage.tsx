import { useEffect, useState } from "react";
import { listBatches, registerBatch } from "../../api/production";
import { listProducts } from "../../api/inventory";
import type { BatchPublic, Product } from "../../types/api";

export default function BatchesPage() {
  const [batches, setBatches] = useState<BatchPublic[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    quantity_produced: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([listBatches(), listProducts()]);
      setBatches(b);
      setProducts(p);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await registerBatch({
        product_id: Number(form.product_id),
        quantity_produced: Number(form.quantity_produced),
        notes: form.notes || null,
      });
      setShowModal(false);
      setForm({ product_id: "", quantity_produced: "", notes: "" });
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Error al registrar lote";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const productName = (id: number) =>
    products.find((p) => p.id === id)?.name ?? `#${id}`;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Lotes de producción</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Registrar lote
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Notas</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{productName(b.product_id)}</td>
                <td>{b.quantity_produced}</td>
                <td>{b.notes ?? "—"}</td>
                <td>{new Date(b.produced_at).toLocaleString("es-AR")}</td>
              </tr>
            ))}
            {batches.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Sin lotes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Registrar lote</h2>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Producto
                <select
                  required
                  value={form.product_id}
                  onChange={(e) =>
                    setForm({ ...form, product_id: e.target.value })
                  }
                >
                  <option value="">Seleccionar…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Cantidad producida
                <input
                  type="number"
                  min="0.001"
                  step="any"
                  required
                  value={form.quantity_produced}
                  onChange={(e) =>
                    setForm({ ...form, quantity_produced: e.target.value })
                  }
                />
              </label>
              <label>
                Notas
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando…" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

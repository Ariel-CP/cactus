import { useEffect, useState } from "react";
import { listSales, listCustomers, createSale } from "../../api/sales";
import { listProducts } from "../../api/inventory";
import type {
  Customer,
  Product,
  Sale,
  SaleCreate,
  SaleItemCreate,
} from "../../types/api";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = (): SaleCreate => ({
    customer_id: null,
    payment_method: "cash",
    notes: "",
    items: [{ product_id: 0, quantity: 1, unit_price: 0 }],
  });
  const [form, setForm] = useState<SaleCreate>(emptyForm());

  async function load() {
    setLoading(true);
    try {
      const [s, c, p] = await Promise.all([
        listSales(),
        listCustomers(),
        listProducts(),
      ]);
      setSales(s);
      setCustomers(c);
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

  function updateItem(idx: number, patch: Partial<SaleItemCreate>) {
    const items = [...form.items];
    items[idx] = { ...items[idx], ...patch };
    setForm({ ...form, items });
  }

  function addItem() {
    setForm({
      ...form,
      items: [...form.items, { product_id: 0, quantity: 1, unit_price: 0 }],
    });
  }

  function removeItem(idx: number) {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createSale(form);
      setShowModal(false);
      setForm(emptyForm());
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Error al registrar venta";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const customerName = (id: number | null) =>
    id ? (customers.find((c) => c.id === id)?.name ?? `#${id}`) : "—";

  const productName = (id: number) =>
    products.find((p) => p.id === id)?.name ?? `#${id}`;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ventas</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nueva venta
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
              <th>Cliente</th>
              <th>Método</th>
              <th>Total</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{customerName(s.customer_id)}</td>
                <td>{s.payment_method}</td>
                <td>${s.total.toFixed(2)}</td>
                <td>{new Date(s.sold_at).toLocaleString("es-AR")}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Sin ventas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 560 }}>
            <h2>Nueva venta</h2>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Cliente
                <select
                  value={form.customer_id ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      customer_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                >
                  <option value="">Sin cliente</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Método de pago
                <select
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      payment_method: e.target.value as SaleCreate["payment_method"],
                    })
                  }
                >
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="credit">Cuenta corriente</option>
                </select>
              </label>

              <label>Notas</label>
              <textarea
                value={form.notes ?? ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />

              <p style={{ fontWeight: 600, marginTop: "0.5rem" }}>Items</p>
              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}
                >
                  <select
                    required
                    value={item.product_id || ""}
                    onChange={(e) => {
                      const pid = Number(e.target.value);
                      const prod = products.find((p) => p.id === pid);
                      updateItem(idx, {
                        product_id: pid,
                        unit_price: prod?.sale_price ?? 0,
                      });
                    }}
                    style={{ flex: 2 }}
                  >
                    <option value="">Producto…</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    placeholder="Qty"
                    required
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, { quantity: Number(e.target.value) })
                    }
                    style={{ width: 70 }}
                  />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="Precio"
                    required
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(idx, { unit_price: Number(e.target.value) })
                    }
                    style={{ width: 90 }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeItem(idx)}
                    disabled={form.items.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addItem}
              >
                + Item
              </button>

              <div className="modal-actions" style={{ marginTop: "1rem" }}>
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
                  {saving ? "Guardando…" : "Registrar venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { listPurchases, createPurchase } from "../../api/purchases";
import { listIngredients } from "../../api/inventory";
import type { Ingredient, Purchase, PurchaseCreate, PurchaseItemCreate } from "../../types/api";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = (): PurchaseCreate => ({
    supplier: "",
    notes: "",
    items: [{ ingredient_id: 0, quantity: 1, unit_cost: 0 }],
  });
  const [form, setForm] = useState<PurchaseCreate>(emptyForm());

  async function load() {
    setLoading(true);
    try {
      const [p, i] = await Promise.all([listPurchases(), listIngredients()]);
      setPurchases(p);
      setIngredients(i);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function updateItem(idx: number, patch: Partial<PurchaseItemCreate>) {
    const items = [...form.items];
    items[idx] = { ...items[idx], ...patch };
    setForm({ ...form, items });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createPurchase(form);
      setShowModal(false);
      setForm(emptyForm());
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Error al registrar compra";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Compras</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nueva compra
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
              <th>Proveedor</th>
              <th>Total</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.supplier ?? "—"}</td>
                <td>${p.total.toFixed(2)}</td>
                <td>{new Date(p.purchased_at).toLocaleString("es-AR")}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  Sin compras registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 540 }}>
            <h2>Nueva compra</h2>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Proveedor
                <input
                  value={form.supplier ?? ""}
                  onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                />
              </label>
              <label>
                Notas
                <textarea
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>

              <p style={{ fontWeight: 600, marginTop: "0.5rem" }}>Items</p>
              {form.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}
                >
                  <select
                    required
                    value={item.ingredient_id || ""}
                    onChange={(e) =>
                      updateItem(idx, { ingredient_id: Number(e.target.value) })
                    }
                    style={{ flex: 2 }}
                  >
                    <option value="">Insumo…</option>
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
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
                    placeholder="Costo unit."
                    required
                    value={item.unit_cost}
                    onChange={(e) =>
                      updateItem(idx, { unit_cost: Number(e.target.value) })
                    }
                    style={{ width: 100 }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() =>
                      setForm({
                        ...form,
                        items: form.items.filter((_, i) => i !== idx),
                      })
                    }
                    disabled={form.items.length === 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setForm({
                    ...form,
                    items: [
                      ...form.items,
                      { ingredient_id: 0, quantity: 1, unit_cost: 0 },
                    ],
                  })
                }
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
                  {saving ? "Guardando…" : "Registrar compra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

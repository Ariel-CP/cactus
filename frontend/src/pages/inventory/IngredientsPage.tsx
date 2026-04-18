import { useEffect, useState } from "react";
import {
  createIngredient,
  deleteIngredient,
  listIngredients,
} from "../../api/inventory";
import type { Ingredient } from "../../types/api";

const EMPTY_FORM = {
  name: "",
  unit: "ml",
  stock: 0,
  min_stock: 0,
  cost_per_unit: 0,
  description: "",
  category_id: null as number | null,
};

export function IngredientsPage() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (lowStock = false) => {
    setLoading(true);
    try {
      setItems(await listIngredients(lowStock));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createIngredient(form);
      setShowModal(false);
      setForm(EMPTY_FORM);
      await load();
    } catch {
      setError("No se pudo guardar el insumo.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este insumo?")) return;
    await deleteIngredient(id);
    await load();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Insumos</h2>
        <button onClick={() => setShowModal(true)}>+ Nuevo insumo</button>
      </div>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Stock min.</th>
                <th>Costo/u</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{i.unit}</td>
                  <td>
                    {i.stock < i.min_stock ? (
                      <span className="badge-low">{i.stock}</span>
                    ) : (
                      i.stock
                    )}
                  </td>
                  <td>{i.min_stock}</td>
                  <td>${i.cost_per_unit}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(i.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    Sin insumos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleCreate}>
            <h3>Nuevo insumo</h3>
            {error && <p className="error-msg">{error}</p>}
            <label>
              Nombre
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Unidad
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                {["ml", "l", "g", "kg", "u"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
            <label>
              Stock inicial
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: parseFloat(e.target.value) })
                }
              />
            </label>
            <label>
              Stock mínimo
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.min_stock}
                onChange={(e) =>
                  setForm({ ...form, min_stock: parseFloat(e.target.value) })
                }
              />
            </label>
            <label>
              Costo por unidad
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost_per_unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    cost_per_unit: parseFloat(e.target.value),
                  })
                }
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setForm(EMPTY_FORM);
                }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={busy}>
                {busy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

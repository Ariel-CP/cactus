import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  listProducts,
} from "../../api/inventory";
import type { Product } from "../../types/api";

const EMPTY_FORM = {
  name: "",
  sku: "",
  unit: "u",
  stock: 0,
  min_stock: 0,
  sale_price: 0,
  description: "",
  category_id: null as number | null,
};

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (lowStock = false) => {
    setLoading(true);
    try {
      setItems(await listProducts(lowStock));
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
      await createProduct({ ...form, sku: form.sku || null });
      setShowModal(false);
      setForm(EMPTY_FORM);
      await load();
    } catch {
      setError("No se pudo guardar el producto.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteProduct(id);
    await load();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Productos</h2>
        <button onClick={() => setShowModal(true)}>+ Nuevo producto</button>
      </div>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Stock min.</th>
                <th>Precio venta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku ?? "—"}</td>
                  <td>{p.unit}</td>
                  <td>
                    {p.stock < p.min_stock ? (
                      <span className="badge-low">{p.stock}</span>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td>{p.min_stock}</td>
                  <td>${p.sale_price}</td>
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    Sin productos registrados
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
            <h3>Nuevo producto</h3>
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
              SKU (opcional)
              <input
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </label>
            <label>
              Unidad
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                {["u", "ml", "l", "g", "kg"].map((u) => (
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
              Precio de venta
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.sale_price}
                onChange={(e) =>
                  setForm({ ...form, sale_price: parseFloat(e.target.value) })
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

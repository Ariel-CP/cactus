import { useEffect, useState } from "react";
import {
  createIngredient,
  deleteIngredient,
  listCategories,
  listIngredients,
  updateIngredient,
} from "../../api/inventory";
import type { Category, Ingredient } from "../../types/api";

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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createBusy, setCreateBusy] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editBusy, setEditBusy] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async (lowStock = false) => {
    setLoading(true);
    try {
      setItems(await listIngredients(lowStock));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    listCategories().then(setCategories).catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBusy(true);
    setError(null);
    try {
      await createIngredient(createForm);
      setShowCreateModal(false);
      setCreateForm(EMPTY_FORM);
      await load();
    } catch {
      setError("No se pudo guardar el insumo.");
    } finally {
      setCreateBusy(false);
    }
  };

  const openEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditForm({
      name: ingredient.name,
      unit: ingredient.unit,
      stock: ingredient.stock,
      min_stock: ingredient.min_stock,
      cost_per_unit: ingredient.cost_per_unit,
      description: ingredient.description ?? "",
      category_id: ingredient.category_id,
    });
    setError(null);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;

    setEditBusy(true);
    setError(null);
    try {
      await updateIngredient(editingId, editForm);
      setShowEditModal(false);
      setEditingId(null);
      await load();
    } catch {
      setError("No se pudo actualizar el insumo.");
    } finally {
      setEditBusy(false);
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
        <button onClick={() => setShowCreateModal(true)}>+ Nuevo insumo</button>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: "1rem" }}>{error}</p>}

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
                    <div style={{ display: "flex", gap: ".5rem" }}>
                      <button onClick={() => openEdit(i)}>Editar</button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(i.id)}
                      >
                        Eliminar
                      </button>
                    </div>
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

      {showCreateModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleCreate}>
            <h3>Nuevo insumo</h3>
            <label>
              Nombre
              <input
                required
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
              />
            </label>
            <label>
              Unidad
              <select
                value={createForm.unit}
                onChange={(e) =>
                  setCreateForm({ ...createForm, unit: e.target.value })
                }
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
                value={createForm.stock}
                onChange={(e) =>
                  setCreateForm({ ...createForm, stock: parseFloat(e.target.value) })
                }
              />
            </label>
            <label>
              Stock mínimo
              <input
                type="number"
                min="0"
                step="0.01"
                value={createForm.min_stock}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    min_stock: parseFloat(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Costo por unidad
              <input
                type="number"
                min="0"
                step="0.01"
                value={createForm.cost_per_unit}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    cost_per_unit: parseFloat(e.target.value),
                  })
                }
              />
            </label>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm(EMPTY_FORM);
                }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={createBusy}>
                {createBusy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleUpdate}>
            <h3>Editar insumo</h3>
            <label>
              Nombre
              <input
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </label>
            <label>
              Unidad
              <select
                value={editForm.unit}
                onChange={(e) =>
                  setEditForm({ ...editForm, unit: e.target.value })
                }
              >
                {["ml", "l", "g", "kg", "u"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
            <label>
              Stock
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.stock}
                onChange={(e) =>
                  setEditForm({ ...editForm, stock: parseFloat(e.target.value) })
                }
              />
            </label>
            <label>
              Stock mínimo
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.min_stock}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    min_stock: parseFloat(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Costo por unidad
              <input
                type="number"
                min="0"
                step="0.01"
                value={editForm.cost_per_unit}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cost_per_unit: parseFloat(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Descripción
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </label>
            <label>
              Categoría
              <select
                value={editForm.category_id ?? ""}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    category_id: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              >
                <option value="">— Sin categoría —</option>
                {categories
                  .filter((c) => c.kind === "ingredient" || c.kind === "both")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingId(null);
                }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={editBusy}>
                {editBusy ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

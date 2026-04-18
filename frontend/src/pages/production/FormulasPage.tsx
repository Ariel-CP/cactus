import { useEffect, useState } from "react";
import { getFormula, saveFormula } from "../../api/production";
import { listProducts, listIngredients } from "../../api/inventory";
import type { FormulaLinePublic, Ingredient, Product } from "../../types/api";

interface EditLine {
  ingredient_id: number | "";
  quantity: number | "";
}

export default function FormulasPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [formula, setFormula] = useState<FormulaLinePublic[]>([]);
  const [editLines, setEditLines] = useState<EditLine[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([listProducts(), listIngredients()]).then(([p, i]) => {
      setProducts(p);
      setIngredients(i);
    });
  }, []);

  async function loadFormula(productId: number) {
    setError(null);
    const lines = await getFormula(productId);
    setFormula(lines);
    setEditLines(
      lines.map((l) => ({ ingredient_id: l.ingredient_id, quantity: l.quantity }))
    );
  }

  async function handleSave() {
    if (!selectedProduct) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveFormula({
        product_id: Number(selectedProduct),
        lines: editLines.map((l) => ({
          ingredient_id: Number(l.ingredient_id),
          quantity: Number(l.quantity),
        })),
      });
      setFormula(saved);
      setEditLines(
        saved.map((l) => ({ ingredient_id: l.ingredient_id, quantity: l.quantity }))
      );
      setEditing(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Error al guardar";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const ingName = (id: number) =>
    ingredients.find((i) => i.id === id)?.name ?? `#${id}`;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Fórmulas de producción</h1>
      </div>

      <div className="form" style={{ maxWidth: 400, marginBottom: "1.5rem" }}>
        <label>
          Seleccionar producto
          <select
            value={selectedProduct}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedProduct(id);
              setEditing(false);
              void loadFormula(id);
            }}
          >
            <option value="">—</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error-text">{error}</p>}

      {selectedProduct !== "" && (
        <>
          {!editing ? (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Cantidad por unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {formula.map((l) => (
                    <tr key={l.id}>
                      <td>{ingName(l.ingredient_id)}</td>
                      <td>{l.quantity}</td>
                    </tr>
                  ))}
                  {formula.length === 0 && (
                    <tr>
                      <td colSpan={2} style={{ textAlign: "center" }}>
                        Sin líneas — editar para agregar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <button
                className="btn btn-primary"
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  setEditing(true);
                  if (editLines.length === 0)
                    setEditLines([{ ingredient_id: "", quantity: "" }]);
                }}
              >
                Editar fórmula
              </button>
            </>
          ) : (
            <>
              {editLines.map((line, idx) => (
                <div
                  key={idx}
                  style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}
                >
                  <select
                    value={line.ingredient_id}
                    onChange={(e) => {
                      const copy = [...editLines];
                      copy[idx] = { ...copy[idx], ingredient_id: Number(e.target.value) };
                      setEditLines(copy);
                    }}
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
                    min="0"
                    step="any"
                    placeholder="Cantidad"
                    value={line.quantity}
                    onChange={(e) => {
                      const copy = [...editLines];
                      copy[idx] = { ...copy[idx], quantity: Number(e.target.value) };
                      setEditLines(copy);
                    }}
                    style={{ width: 100 }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() =>
                      setEditLines(editLines.filter((_, i) => i !== idx))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setEditLines([...editLines, { ingredient_id: "", quantity: "" }])
                  }
                >
                  + Agregar línea
                </button>
                <button
                  className="btn btn-primary"
                  disabled={saving || editLines.length === 0}
                  onClick={handleSave}
                >
                  {saving ? "Guardando…" : "Guardar fórmula"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

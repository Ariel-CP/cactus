import { useEffect, useState } from "react";
import { listCustomers, createCustomer, deleteCustomer } from "../../api/sales";
import type { Customer, CustomerCreate } from "../../types/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CustomerCreate>({ name: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setCustomers(await listCustomers());
    } catch {
      setError("Error al cargar clientes");
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
      await createCustomer(form);
      setShowModal(false);
      setForm({ name: "" });
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Error al crear cliente";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar cliente "${name}"?`)) return;
    try {
      await deleteCustomer(id);
      await load();
    } catch {
      setError("No se pudo eliminar el cliente");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Nuevo cliente
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone ?? "—"}</td>
                <td>{c.email ?? "—"}</td>
                <td>
                  <span
                    className={c.balance > 0 ? "badge badge-danger" : "badge badge-ok"}
                  >
                    ${c.balance.toFixed(2)}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(c.id, c.name)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Sin clientes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Nuevo cliente</h2>
            <form onSubmit={handleSubmit} className="form">
              <label>
                Nombre *
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Teléfono
                <input
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </label>
              <label>
                Notas
                <textarea
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                  {saving ? "Guardando…" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

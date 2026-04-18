import { useEffect, useMemo, useState } from "react";
import {
  createUser,
  deactivateUser,
  listUsers,
  updateUser,
  type UserCreatePayload,
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../types/api";

const EMPTY_CREATE_FORM: UserCreatePayload = {
  username: "",
  full_name: "",
  password: "",
  role: "operator",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] =
    useState<UserCreatePayload>(EMPTY_CREATE_FORM);
  const [createBusy, setCreateBusy] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "operator">("operator");
  const [editPassword, setEditPassword] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editBusy, setEditBusy] = useState(false);

  const unauthorized = useMemo(
    () => currentUser?.role !== "admin",
    [currentUser?.role]
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!unauthorized) {
      load();
    } else {
      setLoading(false);
    }
  }, [unauthorized]);

  const openEdit = (target: User) => {
    setEditingUser(target);
    setEditFullName(target.full_name);
    setEditRole(target.role === "admin" ? "admin" : "operator");
    setEditPassword("");
    setEditIsActive(target.is_active);
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditFullName("");
    setEditPassword("");
    setEditRole("operator");
    setEditIsActive(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBusy(true);
    setError(null);
    try {
      await createUser(createForm);
      setShowCreateModal(false);
      setCreateForm(EMPTY_CREATE_FORM);
      await load();
    } catch {
      setError("No se pudo crear el usuario.");
    } finally {
      setCreateBusy(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setEditBusy(true);
    setError(null);
    try {
      const payload: {
        full_name?: string;
        role?: "admin" | "operator";
        password?: string;
        is_active?: boolean;
      } = {
        full_name: editFullName,
        role: editRole,
        is_active: editIsActive,
      };

      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      await updateUser(editingUser.id, payload);
      closeEdit();
      await load();
    } catch {
      setError("No se pudo actualizar el usuario.");
    } finally {
      setEditBusy(false);
    }
  };

  const handleDeactivate = async (target: User) => {
    if (!confirm(`¿Desactivar a ${target.username}?`)) return;
    setError(null);
    try {
      await deactivateUser(target.id);
      await load();
    } catch {
      setError("No se pudo desactivar el usuario.");
    }
  };

  if (unauthorized) {
    return (
      <div>
        <div className="page-header">
          <h2>Usuarios</h2>
        </div>
        <p className="error-msg">Solo administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Usuarios</h2>
        <button onClick={() => setShowCreateModal(true)}>+ Nuevo usuario</button>
      </div>

      {error && <p className="error-msg" style={{ marginBottom: "1rem" }}>{error}</p>}

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.full_name}</td>
                  <td>
                    <span className={u.role === "admin" ? "badge-role-admin" : "badge-role-operator"}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={u.is_active ? "badge-status-active" : "badge-status-inactive"}>
                      {u.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: ".5rem" }}>
                    <button onClick={() => openEdit(u)}>Editar</button>
                    {u.is_active && (
                      <button className="btn-danger" onClick={() => handleDeactivate(u)}>
                        Desactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Sin usuarios
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
            <h3>Nuevo usuario</h3>
            <label>
              Usuario
              <input
                required
                minLength={3}
                maxLength={50}
                value={createForm.username}
                onChange={(e) =>
                  setCreateForm({ ...createForm, username: e.target.value })
                }
              />
            </label>
            <label>
              Nombre completo
              <input
                required
                minLength={2}
                maxLength={120}
                value={createForm.full_name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, full_name: e.target.value })
                }
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                required
                minLength={8}
                maxLength={72}
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm({ ...createForm, password: e.target.value })
                }
              />
            </label>
            <label>
              Rol
              <select
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    role: e.target.value as "admin" | "operator",
                  })
                }
              >
                <option value="operator">operator</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm(EMPTY_CREATE_FORM);
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

      {editingUser && (
        <div className="modal-overlay">
          <form className="modal" onSubmit={handleSaveEdit}>
            <h3>Editar usuario</h3>
            <p className="subtitle">{editingUser.username}</p>
            <label>
              Nombre completo
              <input
                required
                minLength={2}
                maxLength={120}
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
              />
            </label>
            <label>
              Rol
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as "admin" | "operator")}
              >
                <option value="operator">operator</option>
                <option value="admin">admin</option>
              </select>
            </label>
            <label>
              Nueva contraseña (opcional)
              <input
                type="password"
                minLength={8}
                maxLength={72}
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Dejar vacío para no cambiar"
              />
            </label>
            <label>
              Estado
              <select
                value={editIsActive ? "active" : "inactive"}
                onChange={(e) => setEditIsActive(e.target.value === "active")}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={closeEdit}>
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
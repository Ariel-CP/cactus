import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">🌵 Cactus</div>
        <nav>
          <Link to="/">Inicio</Link>
          <p className="nav-group-label">Inventario</p>
          <Link to="/inventory/ingredients">Insumos</Link>
          <Link to="/inventory/products">Productos</Link>
          <p className="nav-group-label">Producción</p>
          <Link to="/production/formulas">Fórmulas</Link>
          <Link to="/production/batches">Lotes</Link>
          <p className="nav-group-label">Ventas</p>
          <Link to="/sales">Ventas</Link>
          <Link to="/sales/customers">Clientes</Link>
          <p className="nav-group-label">Compras</p>
          <Link to="/purchases">Compras</Link>
          <p className="nav-group-label">Reportes</p>
          <Link to="/reports">Reportes</Link>
          {user?.role === "admin" && (
            <>
              <p className="nav-group-label">Administración</p>
              <Link to="/admin/users">Usuarios</Link>
            </>
          )}
        </nav>
        <div className="sidebar-user">
          <span>{user?.full_name}</span>
          <button onClick={handleLogout}>Salir</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

import { useAuth } from "../context/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Bienvenido, {user?.full_name}</h2>
      <p>Rol: <strong>{user?.role}</strong></p>
      <p>Usá el menú para navegar entre módulos.</p>
    </div>
  );
}

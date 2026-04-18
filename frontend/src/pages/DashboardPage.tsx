import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { restartBackend } from "../api/users";

export function DashboardPage() {
  const { user } = useAuth();
  const [restarting, setRestarting] = useState(false);
  const [restartMsg, setRestartMsg] = useState<string | null>(null);

  const handleRestart = async () => {
    if (!confirm("¿Reiniciar el servidor backend?")) return;
    setRestarting(true);
    setRestartMsg(null);
    try {
      await restartBackend();
      setRestartMsg("Reinicio enviado. El servidor volverá en unos segundos.");
    } catch {
      setRestartMsg("Error al enviar la señal de reinicio.");
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div>
      <h2>Bienvenido, {user?.full_name}</h2>
      <p>Rol: <strong>{user?.role}</strong></p>
      <p>Usá el menú para navegar entre módulos.</p>

      {user?.role === "admin" && (
        <div style={{ marginTop: "2rem" }}>
          <button
            className="btn-danger"
            onClick={handleRestart}
            disabled={restarting}
          >
            {restarting ? "Reiniciando…" : "🔄 Reiniciar backend"}
          </button>
          {restartMsg && (
            <p style={{ marginTop: ".75rem", color: "var(--text-muted)", fontSize: ".9rem" }}>
              {restartMsg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

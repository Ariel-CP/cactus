import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { IngredientsPage } from "./pages/inventory/IngredientsPage";
import { ProductsPage } from "./pages/inventory/ProductsPage";
import FormulasPage from "./pages/production/FormulasPage";
import BatchesPage from "./pages/production/BatchesPage";
import CustomersPage from "./pages/sales/CustomersPage";
import SalesPage from "./pages/sales/SalesPage";
import PurchasesPage from "./pages/purchases/PurchasesPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/admin/UsersPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route
                path="/inventory/ingredients"
                element={<IngredientsPage />}
              />
              <Route path="/inventory/products" element={<ProductsPage />} />
              <Route path="/production/formulas" element={<FormulasPage />} />
              <Route path="/production/batches" element={<BatchesPage />} />
              <Route path="/sales/customers" element={<CustomersPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

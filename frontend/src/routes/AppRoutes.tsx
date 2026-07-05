import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

function ADRs() {
  return <h2>ADR List</h2>;
}

function CreateADR() {
  return <h2>Create ADR</h2>;
}

function NotFound() {
  return <h2>404 - Page Not Found</h2>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/adrs"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ADRs />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/adrs/create"
        element={
          <ProtectedRoute>
            <AppLayout>
              <CreateADR />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

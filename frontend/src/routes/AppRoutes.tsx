import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import DashboardPage from "../pages/DashboardPage";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

import ADRListPage from "../pages/adrs/ADRListPage";
import ADRCreatePage from "../pages/adrs/ADRCreatePage";
import ADRDetailPage from "../pages/adrs/ADRDetailPage";
import ADREditPage from "../pages/adrs/ADREditPage";
import DependencyGraphPage from "../pages/DependencyGraphPage";

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
              <ADRListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/adrs/create"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ADRCreatePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/adrs/graph"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DependencyGraphPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/adrs/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ADRDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/adrs/:id/edit"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ADREditPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

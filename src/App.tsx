import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import { lazy, Suspense, useEffect } from "react";
import { useAutoCleanup } from "./hooks/useAutoCleanup";
import UpdateManager from "./components/UpdateManager";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const Cashier = lazy(() => import("./pages/Cashier"));

function App() {
  useAutoCleanup();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
    };
    init();
  }, [initializeAuth]);

  return (
    <HashRouter>
      <UpdateManager />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-10 h-10 border-4 border-warning border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cashier"
            element={
              <ProtectedRoute>
                <Cashier />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// User pages
import DashboardPage from "./pages/user/DashboardPage";
import AdsPage from "./pages/user/AdsPage";
import SubmissionsPage from "./pages/user/SubmissionsPage";
import WalletPage from "./pages/user/WalletPage";
import WithdrawalsPage from "./pages/user/WithdrawalsPage";

// Admin pages
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminSubmissionsPage from "./pages/admin/AdminSubmissionsPage";
import AdminWithdrawalsPage from "./pages/admin/AdminWithdrawalsPage";
import AdminAdsPage from "./pages/admin/AdminAdsPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function UserApp({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function AdminApp({ children }) {
  return (
    <AdminRoute>
      <AppLayout>{children}</AppLayout>
    </AdminRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-elevated)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-body)",
                fontSize: "13px",
              },
              success: { iconTheme: { primary: "var(--gold)", secondary: "#000" } },
            }}
          />

          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

            {/* User */}
            <Route path="/dashboard" element={<UserApp><DashboardPage /></UserApp>} />
            <Route path="/ads" element={<UserApp><AdsPage /></UserApp>} />
            <Route path="/submissions" element={<UserApp><SubmissionsPage /></UserApp>} />
            <Route path="/wallet" element={<UserApp><WalletPage /></UserApp>} />
            <Route path="/withdrawals" element={<UserApp><WithdrawalsPage /></UserApp>} />

            {/* Admin */}
            <Route path="/admin" element={<AdminApp><AdminOverviewPage /></AdminApp>} />
            <Route path="/admin/submissions" element={<AdminApp><AdminSubmissionsPage /></AdminApp>} />
            <Route path="/admin/withdrawals" element={<AdminApp><AdminWithdrawalsPage /></AdminApp>} />
            <Route path="/admin/ads" element={<AdminApp><AdminAdsPage /></AdminApp>} />
            <Route path="/admin/users" element={<AdminApp><AdminUsersPage /></AdminApp>} />
            <Route path="/admin/logs" element={<AdminApp><AdminLogsPage /></AdminApp>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
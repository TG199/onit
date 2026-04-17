import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Inject x-token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("onit_token");
  if (token) config.headers["x-token"] = token;
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("onit_token");
      localStorage.removeItem("onit_role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ─── Auth ───────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
};

// ─── User ────────────────────────────────────────────────────────────────────
export const userApi = {
  getDashboard: () => api.get("/api/user/dashboard"),
  getProfile: () => api.get("/api/user/profile"),

  // Ads
  getAds: (params) => api.get("/api/user/ads", { params }),

  // Submissions
  submitProof: (adId, proofUrl) =>
    api.post(`/api/user/engagements/${adId}/submit`, { proofUrl }),
  getSubmissions: (params) => api.get("/api/user/engagements", { params }),
  getSubmissionStats: () => api.get("/api/user/engagements/stats"),

  // Wallet
  getWallet: () => api.get("/api/user/wallet"),
  getTransactions: (params) =>
    api.get("/api/user/wallet/transactions", { params }),

  // Withdrawals
  requestWithdrawal: (data) => api.post("/api/user/wallet/withdraw", data),
  getWithdrawals: (params) =>
    api.get("/api/user/wallet/withdrawals", { params }),
  cancelWithdrawal: (id) =>
    api.post(`/api/user/wallet/withdrawals/${id}/cancel`),
  getWithdrawalStats: () => api.get("/api/user/wallet/withdrawals/stats"),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get("/api/admin/stats"),

  // Submissions
  getSubmissions: (params) => api.get("/api/admin/submissions", { params }),
  approveSubmission: (id) => api.post(`/api/admin/submissions/${id}/approve`),
  rejectSubmission: (id, reason) =>
    api.post(`/api/admin/submissions/${id}/reject`, { reason }),

  // Withdrawals
  getWithdrawals: (params) => api.get("/api/admin/withdrawals", { params }),
  processWithdrawal: (id) => api.post(`/api/admin/withdrawals/${id}/process`),
  completeWithdrawal: (id, transactionHash) =>
    api.post(`/api/admin/withdrawals/${id}/complete`, { transactionHash }),
  failWithdrawal: (id, reason) =>
    api.post(`/api/admin/withdrawals/${id}/fail`, { reason }),

  // Ads
  getAds: (params) => api.get("/api/admin/ads", { params }),
  createAd: (data) => api.post("/api/admin/ads", data),
  updateAd: (id, data) => api.patch(`/api/admin/ads/${id}`, data),
  activateAd: (id) => api.post(`/api/admin/ads/${id}/activate`),
  pauseAd: (id) => api.post(`/api/admin/ads/${id}/pause`),

  // Users
  blockUser: (id) => api.post(`/api/admin/users/${id}/block`),
  unblockUser: (id) => api.post(`/api/admin/users/${id}/unblock`),
  auditUser: (id) => api.get(`/api/admin/users/${id}/audit`),

  // Logs
  getLogs: (params) => api.get("/api/admin/logs", { params }),
  getMismatches: () => api.get("/api/admin/audit/mismatches"),
};

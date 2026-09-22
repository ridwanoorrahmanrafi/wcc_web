const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach token if present in browser localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('wcc_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Members
  getMembers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/members?${query}`);
  },
  getMember: (id) => request(`/members/${id}`),
  createMember: (data) => request('/members', { method: 'POST', body: JSON.stringify(data) }),
  updateMember: (id, data) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateMemberStatus: (id, status) => request(`/members/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),
  getMemberStats: () => request('/members/stats'),
  verifyMember: (id) => request(`/members/verify/${id}`),
  submitMemberRequest: (data) => request('/members/requests', { method: 'POST', body: JSON.stringify(data) }),
  getMemberRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/members/requests?${query}`);
  },
  reviewMemberRequest: (id, data) => request(`/members/requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Finance
  getFinanceDashboard: () => request('/finance/dashboard'),
  getAccounts: () => request('/finance/accounts'),
  createAccount: (data) => request('/finance/accounts', { method: 'POST', body: JSON.stringify(data) }),
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/finance/transactions?${query}`);
  },
  createTransaction: (data) => request('/finance/transactions', { method: 'POST', body: JSON.stringify(data) }),
  getIncome: () => request('/finance/income'),
  createIncome: (data) => request('/finance/income', { method: 'POST', body: JSON.stringify(data) }),
  getExpenses: () => request('/finance/expenses'),
  createExpense: (data) => request('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
  getActivities: () => request('/finance/activities'),
  getActivity: (id) => request(`/finance/activities/${id}`),
  getActivityStatement: (id) => request(`/finance/activities/${id}/statement`),
  createActivity: (data) => request('/finance/activities', { method: 'POST', body: JSON.stringify(data) }),
  getReimbursements: () => request('/finance/reimbursements'),
  createReimbursement: (data) => request('/finance/reimbursements', { method: 'POST', body: JSON.stringify(data) }),
  updateReimbursementStatus: (id, data) => request(`/finance/reimbursements/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAdvances: () => request('/finance/advances'),
  createAdvance: (data) => request('/finance/advances', { method: 'POST', body: JSON.stringify(data) }),
  settleAdvance: (id, data) => request(`/finance/advances/${id}/settle`, { method: 'POST', body: JSON.stringify(data) }),
  getVendors: () => request('/finance/vendors'),

  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  googleLogin: (data) => request('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Volunteer Logs
  logVolunteerHours: (data) => request('/auth/volunteer/log', { method: 'POST', body: JSON.stringify(data) }),
  getVolunteerLogs: () => request('/auth/volunteer/logs')
};

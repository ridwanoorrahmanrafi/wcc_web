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

  // Auth & User Management
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  googleLogin: (data) => request('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  getProfile: () => request('/auth/profile'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (currentPassword, newPassword) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyResetToken: (token) => request(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`),
  resetPassword: (token, newPassword) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/auth/users?${query}`);
  },
  getCoordinators: () => request('/auth/coordinators'),
  updateUserWing: (id, assignedWing) => request(`/auth/users/${id}/wing`, { method: 'PATCH', body: JSON.stringify({ assignedWing }) }),
  updateUserRole: (id, role, assignedWing) => request(`/auth/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role, assignedWing }) }),

  // Volunteer Logs
  logVolunteerHours: (data) => request('/auth/volunteer/log', { method: 'POST', body: JSON.stringify(data) }),
  getVolunteerLogs: () => request('/auth/volunteer/logs'),

  // Wings
  getWings: () => request('/wings'),
  getWing: (slug) => request(`/wings/${slug}`),
  createWing: (data) => request('/wings', { method: 'POST', body: JSON.stringify(data) }),
  updateWing: (id, data) => request(`/wings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWing: (id) => request(`/wings/${id}`, { method: 'DELETE' }),

  // Programs
  getPrograms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/programs?${query}`);
  },
  getProgram: (id) => request(`/programs/${id}`),
  createProgram: (data) => request('/programs', { method: 'POST', body: JSON.stringify(data) }),
  updateProgram: (id, data) => request(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProgram: (id) => request(`/programs/${id}`, { method: 'DELETE' }),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/events?${query}`);
  },
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  registerForEvent: (id) => request(`/events/${id}/register`, { method: 'POST' }),
  getMyEventRegistration: (id) => request(`/events/${id}/my-registration`),
  getEventRegistrations: (id) => request(`/events/${id}/registrations`),
  updateEventAttendance: (id, attendees) => request(`/events/${id}/attendance`, { method: 'PATCH', body: JSON.stringify({ attendees }) }),

  // Community Issues
  createIssue: (data) => request('/issues', { method: 'POST', body: JSON.stringify(data) }),
  trackIssueByCode: (code) => request(`/issues/track/${encodeURIComponent(code)}`),
  getIssues: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/issues?${query}`);
  },
  getIssue: (id) => request(`/issues/${id}`),
  updateIssueStatus: (id, status) => request(`/issues/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  assignIssue: (id, data) => request(`/issues/${id}/assign`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Impact Statistics
  getImpactStats: () => request('/stats/impact'),

  // Notifications & Role Invitations
  sendRoleInvitation: (data) => request('/notifications/invite', { method: 'POST', body: JSON.stringify(data) }),
  getMyNotifications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications/my${query ? `?${query}` : ''}`);
  },
  respondToRoleInvitation: (id, action) => request(`/notifications/${id}/respond`, { method: 'POST', body: JSON.stringify({ action }) }),
  getRoleInvitations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notifications/invitations${query ? `?${query}` : ''}`);
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' })
};



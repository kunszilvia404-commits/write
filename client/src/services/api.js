const API_BASE = '/api';

export const chatApi = {
  getSessions: () => fetch(`${API_BASE}/chat/sessions`).then(r => r.json()),
  createSession: () => fetch(`${API_BASE}/chat/sessions`, { method: 'POST' }).then(r => r.json()),
  getSession: (id) => fetch(`${API_BASE}/chat/sessions/${id}`).then(r => r.json()),
  sendMessage: (id, message) => fetch(`${API_BASE}/chat/sessions/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  }).then(r => r.json()),
  deleteSession: (id) => fetch(`${API_BASE}/chat/sessions/${id}`, { method: 'DELETE' }).then(r => r.json())
};

export const diagnoseApi = {
  analyze: (article) => fetch(`${API_BASE}/diagnose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ article })
  }).then(r => r.json())
};

export const ideationApi = {
  start: () => fetch(`${API_BASE}/ideation/start`, { method: 'POST' }).then(r => r.json()),
  respond: (sessionId, message) => fetch(`${API_BASE}/ideation/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, message })
  }).then(r => r.json())
};

export const plansApi = {
  getAll: () => fetch(`${API_BASE}/plans`).then(r => r.json()),
  create: (plan) => fetch(`${API_BASE}/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan)
  }).then(r => r.json()),
  update: (id, data) => fetch(`${API_BASE}/plans/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  toggleTask: (planId, taskId) => fetch(`${API_BASE}/plans/${planId}/tasks/${taskId}`, {
    method: 'PATCH'
  }).then(r => r.json()),
  delete: (id) => fetch(`${API_BASE}/plans/${id}`, { method: 'DELETE' }).then(r => r.json())
};

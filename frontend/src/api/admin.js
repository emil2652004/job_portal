const API_BASE = "http://localhost:4000/admin";

// Admin login
export async function adminLogin(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// Get employer list (JSON only)
export async function getEmployerList(token) {
  const response = await fetch(`${API_BASE}/employer-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Generate employer list PDF (triggers email)
export async function generateEmployerListPdf(token) {
  const response = await fetch(`${API_BASE}/employer-list-pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Get user list (JSON only)
export async function getUserList(token) {
  const response = await fetch(`${API_BASE}/user-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Generate user list PDF (triggers email)
export async function generateUserListPdf(token) {
  const response = await fetch(`${API_BASE}/user-list-pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Delete an employer by ID
export async function deleteEmployer(id, token) {
  const response = await fetch(`${API_BASE}/delete-employer/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Delete a user by ID
export async function deleteUser(id, token) {
  const response = await fetch(`${API_BASE}/delete-user/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Admin logout
export async function adminLogout(token) {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}

// Get all jobs (for admin) -- if you have this endpoint in your backend
export async function getAllJobs(token) {
  const response = await fetch(`${API_BASE}/job-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
}
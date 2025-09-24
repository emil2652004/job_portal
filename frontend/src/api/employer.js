const API_BASE = "https://job-portal-1-2je8.onrender.com/employer";

// Employer register
export async function registerEmployer(data) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Employer email verification
export async function verifyEmail(email, otp) {
  const response = await fetch(`${API_BASE}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return response.json();
}

// Employer login
export async function employerLogin(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// Get employer profile
export async function getEmployerProfile(token) {
  const response = await fetch(`${API_BASE}/profile`, {
    headers: { token },
  });
  return response.json();
}

// Update employer profile
export async function updateEmployerProfile(token, data) {
  const response = await fetch(`${API_BASE}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Delete employer profile
export async function deleteEmployerProfile(token) {
  const response = await fetch(`${API_BASE}/delete`, {
    method: "DELETE",
    headers: { token },
  });
  return response.json();
}

// Employer logout
export async function employerLogout(token) {
  const response = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: { token },
  });
  return response.json();
}

// Forgot password (send OTP)
export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

// Reset password with OTP
export async function resetPassword(email, otp, newPassword) {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  return response.json();
}

// Post a new job
export async function postJob(token, jobData) {
  const response = await fetch(`${API_BASE}/job-post`, {
    method: "POST",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify(jobData),
  });
  return response.json();
}

// Get all jobs posted by employer
export async function getJobList(token) {
  const response = await fetch(`${API_BASE}/job-list`, {
    headers: { token },
  });
  return response.json();
}

// Get registered users for employer's jobs
export async function getRegisteredUsersForJobs(token) {
  const response = await fetch(`${API_BASE}/registered-users-for-jobs`, {
    headers: { token },
  });
  return response.json();
}
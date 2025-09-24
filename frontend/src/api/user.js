const API_BASE = "http://localhost:4000/user";

// User register
export async function registerUser(data) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// User email verification
export async function verifyEmail(email, otp) {
  const response = await fetch(`${API_BASE}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return response.json();
}

// User login
export async function userLogin(email, password) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// Get user profile
export async function getUserProfile(token) {
  const response = await fetch(`${API_BASE}/profile`, {
    headers: { token },
  });
  return response.json();
}

// Update user profile
export async function updateUserProfile(token, data) {
  const response = await fetch(`${API_BASE}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Delete user account
export async function deleteUserAccount(token, id) {
  const response = await fetch(`${API_BASE}/delete-account/${id}`, {
    method: "POST",
    headers: { token },
  });
  return response.json();
}

// User logout
export async function userLogout(token) {
  const response = await fetch("http://localhost:4000/user/logout", {
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

// Upload resume
export async function uploadResume(token, formData) {
  return fetch("http://localhost:4000/user/upload-resume", {
    method: "POST",
    headers: { token }, // Do NOT set Content-Type!
    body: formData,
  }).then((res) => res.json());
}

// Register for a job (with resume upload)
export async function registerJob(token, data) {
  return fetch("http://localhost:4000/user/register-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify(data),
  }).then((res) => res.json());
}

// Get user's job applications
export async function getUserApplications(token) {
  const response = await fetch("http://localhost:4000/user/applications", {
    headers: { token },
  });
  return response.json();
}

// Get all jobs (for user)
export async function getAllJobs(token) {
  const response = await fetch("http://localhost:4000/user/jobs", {
    headers: { token },
  });
  return response.json();
}

// Verify user email
export async function verifyUserEmail(data) {
  return fetch("http://localhost:4000/user/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
}

// Verify employer email
export async function verifyEmployerEmail(data) {
  return fetch("http://localhost:4000/employer/verify-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((res) => res.json());
}
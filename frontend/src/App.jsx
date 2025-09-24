import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployersList from "./pages/admin/EmployersList";
import UsersList from "./pages/admin/UsersList";
import JobsList from "./pages/admin/JobsList";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import EmployerProfile from "./pages/employer/EmployerProfile";
import JobPost from "./pages/employer/JobPost";
import JobList from "./pages/employer/JobList";
import RegisteredUsersForJobs from "./pages/employer/RegisteredUsersForJobs";
import EmailVerificationEmployer from "./pages/employer/EmailVerification";
import ForgotPasswordEmployer from "./pages/employer/ForgotPassword";
import ResetPasswordEmployer from "./pages/employer/ResetPassword";
import UserDashboard from "./pages/user/UserDashboard";
import UserProfile from "./pages/user/UserProfile";
import Applications from "./pages/user/Applications";
import JobApply from "./pages/user/JobApply";
import EmailVerificationUser from "./pages/user/EmailVerification";
import ForgotPasswordUser from "./pages/user/ForgotPassword";
import ResetPasswordUser from "./pages/user/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employers" element={<EmployersList />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/jobs" element={<JobsList />} />

        {/* Employer */}
        <Route path="/employer/dashboard" element={<EmployerDashboard />} />
        <Route path="/employer/profile" element={<EmployerProfile />} />
        <Route path="/employer/job-post" element={<JobPost />} />
        <Route path="/employer/job-list" element={<JobList />} />
        <Route path="/employer/registered-users-for-jobs" element={<RegisteredUsersForJobs />} />
        <Route path="/employer/verify-email" element={<EmailVerificationEmployer />} />
        <Route path="/employer/forgot-password" element={<ForgotPasswordEmployer />} />
        <Route path="/employer/reset-password" element={<ResetPasswordEmployer />} />

        {/* User */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/applications" element={<Applications />} />
        <Route path="/user/apply/:jobId" element={<JobApply />} />
        <Route path="/user/verify-email" element={<EmailVerificationUser />} />
        <Route path="/user/forgot-password" element={<ForgotPasswordUser />} />
        <Route path="/user/reset-password" element={<ResetPasswordUser />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

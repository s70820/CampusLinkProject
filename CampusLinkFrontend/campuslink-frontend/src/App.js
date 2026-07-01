import React from "react";
import "./styles/auth.css";
import "./styles/app-shell.css";
import "./styles/StudentPortal.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import theme from "./theme";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AuthShell from "./components/Design/AuthShell";
import Dashboard from "./components/Dashboard";
import OrganizerDashboard from "./components/OrganizerDashboard";
import CreateProgramme from "./components/CreateProgramme";
import MyProgrammes from "./components/MyProgrammes";
import OrganizerRegistrations from "./components/OrganizerRegistrations";
import OrganizerAttendance from "./components/OrganizerAttendance";
import Reports from "./components/Reports";
import Certificates from "./components/Certificates";
import Profile from "./components/Profile";
import Browse from "./components/Browse";
import Attendance from "./components/Attendance";
import MyRegistrations from "./components/MyRegistrations";
import HEPADashboard from "./components/HEPADashboard";
import RoleRequestForm from "./components/RoleRequestForm";
import RoleRequestManagement from "./components/RoleRequestManagement";
import HEPAMeritManagement from "./components/Hepa/HEPAMeritManagement";
import HEPAReports from "./components/Hepa/HEPAReports";
import HEPAAnalytics from "./components/Hepa/HEPAAnalytics";
import MeritSummary from "./components/Student/MeritSummary";
import StudentCertificates from "./components/Student/StudentCertificates";
import MPPDashboard from "./components/MPPDashboard";
import MPPProgrammeReviews from "./components/MPPProgrammeReviews";
import MPPProgrammeRecords from "./components/MPPProgrammeRecords";
import HEPAProgrammeApprovals from "./components/HEPAProgrammeApprovals";
import HEPAProgrammeRecords from "./components/HEPAProgrammeRecords";
import UserManagement from "./components/UserManagement";
import AdvisorApprovalPage from "./components/AdvisorApprovalPage";
import RequireRole from "./components/auth/RequireRole";
import SessionSync from "./components/SessionSync";
import { appBasename } from "./config/appConfig";

const OrganizerOnly = ({ children }) => (
  <RequireRole allowedRoles={["ORGANIZER"]}>{children}</RequireRole>
);

const MppOnly = ({ children }) => (
  <RequireRole allowedRoles={["MPP"]}>{children}</RequireRole>
);

const HepaOnly = ({ children }) => (
  <RequireRole allowedRoles={["HEPA"]}>{children}</RequireRole>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={appBasename || undefined}>
      <SessionSync />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route element={<AuthShell />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/registrations" element={<MyRegistrations />} />
        <Route path="/student/dashboard" element={<Dashboard />} />
        <Route path="/student/merit-summary" element={<MeritSummary />} />
        <Route path="/student/certificates" element={<StudentCertificates />} />
        <Route path="/organizer/dashboard" element={<OrganizerOnly><OrganizerDashboard /></OrganizerOnly>} />
        <Route path="/organizer/create-programme" element={<OrganizerOnly><CreateProgramme /></OrganizerOnly>} />
        <Route path="/organizer/create-programme/:programmeId" element={<OrganizerOnly><CreateProgramme /></OrganizerOnly>} />
        <Route path="/organizer/programmes" element={<OrganizerOnly><MyProgrammes /></OrganizerOnly>} />
        <Route path="/organizer/registrations" element={<OrganizerOnly><OrganizerRegistrations /></OrganizerOnly>} />
        <Route path="/organizer/attendance" element={<OrganizerOnly><OrganizerAttendance /></OrganizerOnly>} />
        <Route path="/organizer/reports" element={<OrganizerOnly><Reports /></OrganizerOnly>} />
        <Route path="/organizer/certificates" element={<OrganizerOnly><Certificates /></OrganizerOnly>} />
        <Route path="/mpp/dashboard" element={<MppOnly><MPPDashboard /></MppOnly>} />
        <Route path="/mpp/reviews" element={<MppOnly><MPPProgrammeReviews /></MppOnly>} />
        <Route path="/mpp/records" element={<MppOnly><MPPProgrammeRecords /></MppOnly>} />
        <Route path="/mpp/users" element={<MppOnly><UserManagement portalRole="MPP" /></MppOnly>} />
        <Route path="/admin/dashboard" element={<HepaOnly><HEPADashboard /></HepaOnly>} />
        <Route path="/admin/approvals" element={<HepaOnly><HEPAProgrammeApprovals /></HepaOnly>} />
        <Route path="/admin/records" element={<HepaOnly><HEPAProgrammeRecords /></HepaOnly>} />
        <Route path="/admin/users" element={<HepaOnly><UserManagement portalRole="HEPA" /></HepaOnly>} />
        <Route path="/admin/requests" element={<HepaOnly><RoleRequestManagement /></HepaOnly>} />
        <Route path="/admin/merit-management" element={<HepaOnly><HEPAMeritManagement /></HepaOnly>} />
        <Route path="/admin/reports" element={<HepaOnly><HEPAReports /></HepaOnly>} />
        <Route path="/admin/analytics" element={<HepaOnly><HEPAAnalytics /></HepaOnly>} />
        <Route path="/student/request-role" element={<RoleRequestForm />} />
        <Route path="/advisor-approval/:token" element={<AdvisorApprovalPage />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;

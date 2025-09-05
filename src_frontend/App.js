import { Routes, Route, Navigate } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";
import EmployerDashboard from "./pages/EmployerDashboard";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";
import Applications from "./pages/Applications";
import EmployerApplications from "./pages/EmployerApplications";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import ResumeUpload from "./pages/ResumeUpload";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <>
      <AppNavbar />
      <div className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          <Route element={<PrivateRoute roles={["employer"]} />}>
            <Route path="/employer/dashboard" element={<EmployerDashboard />} />
            <Route path="/employer/post-job" element={<PostJob />} />
            <Route path="/employer/manage-jobs" element={<ManageJobs />} />
            <Route path="/employer/applications" element={<EmployerApplications />} />
            <Route path="/employer/profile" element={<Profile />} />
          </Route>


          <Route element={<PrivateRoute roles={["job_seeker"]} />}>
            <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard />} />
            <Route path="/jobseeker/applications" element={<Applications />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume" element={<ResumeUpload />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;

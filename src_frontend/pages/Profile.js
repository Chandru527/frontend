// src_frontend/pages/Profile.js
import { useAuth } from "../context/AuthContext";
import JobSeekerProfile from "./JobSeekerProfile";
import EmployerProfile from "./EmployerProfile";

export default function Profile() {
    const { user } = useAuth();
    const roles = user?.roles || [];

    if (roles.includes("job_seeker")) {
        return <JobSeekerProfile />;
    }
    if (roles.includes("employer")) {
        return <EmployerProfile />;
    }
    return <div>Please log in to access your profile.</div>;
}

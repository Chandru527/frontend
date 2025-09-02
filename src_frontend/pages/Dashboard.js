import { useAuth } from "../context/AuthContext";
import EmployerDashboard from "./EmployerDashboard";
import JobSeekerDashboard from "./JobSeekerDashboard";

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) return <p>Please login first.</p>;

    if (user.role === "employer") {
        return <EmployerDashboard />;
    } else if (user.role === "job_seeker") {
        return <JobSeekerDashboard />;
    } else {
        return <p>Unknown role</p>;
    }
}

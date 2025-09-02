import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.userId) return;

        const fetchApplications = async () => {
            try {
                const { data } = await axiosClient.get(`/applications/by-job-seeker/${user.userId}`);
                const mapped = data.map(app => ({
                    applicationId: app.applicationId,
                    jobTitle: app.jobListing?.title || "N/A",
                    applicationDate: app.applicationDate,
                    status: app.status || "Applied"
                }));
                setApplications(mapped);
            } catch (err) {
                console.error("Error fetching applications:", err.response?.data || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [user]);

    if (!user) return <div>Loading user info...</div>;
    if (loading) return <div>Loading applications...</div>;
    if (!applications.length) return <div>No applications found.</div>;

    return (
        <div className="container mt-4">
            <h3>My Applications</h3>
            <ul className="list-group">
                {applications.map((app) => (
                    <li key={app.applicationId} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{app.jobTitle}</strong> – Applied on {app.applicationDate}
                        </div>
                        <span className={`badge ${app.status === "pending" ? "bg-warning" :
                                app.status === "approved" ? "bg-success" :
                                    "bg-secondary"
                            }`}>
                            {app.status}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

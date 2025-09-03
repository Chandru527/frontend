import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobSeekerId, setJobSeekerId] = useState(null);
    const [error, setError] = useState(null);

    // Added: Function to securely view resume via authorized API call
    const viewResume = async (filePath) => {
        if (!filePath) {
            alert("No resume available");
            return;
        }
        try {
            const response = await axiosClient.get(`/resumes/download`, {
                params: { path: filePath },
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            window.open(url, "_blank");
            // Do NOT revoke URL immediately; allow browser to load the content
        } catch (error) {
            alert("Failed to load resume.");
            console.error("View resume error:", error);
        }
    };

    useEffect(() => {
        const uid = user?.userId || user?.id;
        if (!uid) {
            setError("User ID not found. Please log in.");
            setLoading(false);
            return;
        }
        axiosClient
            .get(`/job-seekers/by-user/${uid}`)
            .then(({ data }) => {
                const seekerId = data.jobSeekerId || data.id;
                setJobSeekerId(seekerId);
                if (!seekerId) setError("Job seeker profile not found. Please complete your profile.");
            })
            .catch(() => {
                setError("Unable to fetch job seeker profile.");
            })
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        if (!jobSeekerId) return;
        axiosClient
            .get(`/applications/seeker/${jobSeekerId}`)
            .then(({ data }) => {
                const arr = Array.isArray(data) ? data : data ? [data] : [];
                setApplications(
                    arr.map((app) => ({
                        applicationId: app.applicationId || app.id,
                        jobListingId: app.jobListingId || (app.jobListing && app.jobListing.id),
                        jobTitle: (app.jobListing && app.jobListing.title) || app.jobTitle || "N/A",
                        applicationDate: app.applicationDate,
                        status: app.status || "Applied",
                        filePath: app.filePath || "",
                    }))
                );
            })
            .catch((err) => {
                if (err.response?.status === 404) setApplications([]);
                else setError("Error fetching applications.");
            });
    }, [jobSeekerId]);

    if (!user?.id && !user?.userId) return <div>Loading user info...</div>;
    if (loading) return <div>Loading applications...</div>;
    if (error)
        return (
            <div className="container mt-4">
                <h2>My Applications</h2>
                <div className="alert alert-danger">
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => (window.location.href = "/profile")}>
                        Complete Profile
                    </button>
                </div>
            </div>
        );

    return (
        <div className="container mt-4">
            <h2>My Applications</h2>
            <div style={{ fontSize: 12, marginBottom: 10 }}>
                <strong>Debug Info:</strong><br />
                User ID: {user?.userId || user?.id}
                <br />
                JobSeeker ID: {jobSeekerId}
                <br />
                Applications: {applications.length}
            </div>
            {applications.length === 0 ? (
                <div className="alert alert-warning">
                    <h4>No Applications Found</h4>
                    <p>You haven't applied to any jobs yet.</p>
                    <p>
                        Visit the <a href="/job-seeker-dashboard">Job Dashboard</a> to browse and apply for jobs.
                    </p>
                </div>
            ) : (
                <div className="row">
                    {applications.map((app) => (
                        <div key={app.applicationId} className="col-md-6 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{app.jobTitle}</h5>
                                    <p className="card-text">
                                        <strong>Applied on:</strong> {app.applicationDate}
                                        <br />
                                        <strong>Status:</strong>&nbsp;
                                        <span
                                            className={`badge ms-2 ${app.status.toLowerCase() === "pending"
                                                    ? "bg-warning"
                                                    : app.status.toLowerCase() === "accepted" || app.status.toLowerCase() === "approved"
                                                        ? "bg-success"
                                                        : "bg-danger"
                                                }`}
                                        >
                                            {app.status.toLowerCase() === "pending" ? "Applied" : app.status}
                                        </span>
                                    </p>
                                    <small className="text-muted">
                                        Application ID: {app.applicationId} | Job ID: {app.jobListingId}
                                    </small>
                                    {app.filePath ? (
                                        <div style={{ marginTop: 8 }}>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => viewResume(app.filePath)}
                                            >
                                                View Resume
                                            </button>
                                            <span style={{ marginLeft: 10, fontSize: "0.8em", color: "#666" }}>
                                                {app.filePath.split(/[\\/]/).pop()}
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{ color: "#aaa", marginTop: 8 }}>No Resume Attached</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobSeekerId, setJobSeekerId] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        const uid = user?.userId || user?.id;
        console.log("User in Applications:", user);

        if (!uid) {
            setError("User ID not found. Please login again.");
            setLoading(false);
            return;
        }

        axiosClient
            .get(`/job-seekers/by-user/${uid}`)
            .then(({ data }) => {
                const seekerId = data.jobSeekerId || data.id;
                setJobSeekerId(seekerId);
                if (!seekerId) {
                    setError("JobSeeker profile not found. Please complete your profile first.");
                }
            })
            .catch(() => {
                setError("Unable to fetch job seeker profile. Please create your profile.");
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
                        jobListingId: app.jobListingId || app.jobListing?.id,
                        jobTitle: app.jobListing?.title || app.jobTitle || "N/A",
                        applicationDate: app.applicationDate,
                        status: app.status || "Applied",
                    }))
                );
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    setApplications([]);
                } else {
                    setError("Error fetching applications");
                }
            })
            .finally(() => setLoading(false));
    }, [jobSeekerId]);

    if (!user?.userId && !user?.id) {
        return <div className="container mt-4">Loading user info...</div>;
    }
    if (loading) {
        return <div className="container mt-4">Loading applications...</div>;
    }
    if (error) {
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
    }

    return (
        <div className="container mt-4">
            <h2>My Applications</h2>
            <div className="alert alert-info" style={{ fontSize: "12px" }}>
                <strong>Debug Info:</strong><br />
                User ID: {user?.userId || user?.id}<br />
                JobSeeker ID: {jobSeekerId}<br />
                Applications Count: {applications.length}
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
                                        <strong>Status:</strong>{" "}
                                        <span
                                            className={`badge ms-2 ${app.status.toLowerCase() === "pending"
                                                ? "bg-warning"
                                                : app.status.toLowerCase() === "accepted" || app.status.toLowerCase() === "approved"
                                                    ? "bg-success"
                                                    : app.status.toLowerCase() === "rejected"
                                                        ? "bg-danger"
                                                        : "bg-secondary"
                                                }`}
                                        >
                                            {app.status.toLowerCase() === "pending" ? "Applied" : app.status}
                                        </span>
                                    </p>
                                    <small className="text-muted">
                                        Application ID: {app.applicationId} | Job ID: {app.jobListingId}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

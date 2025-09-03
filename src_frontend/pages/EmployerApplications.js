import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function EmployerApplications() {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employerId, setEmployerId] = useState(null);

    const uid = user?.userId || user?.id;

    // Added: Function to securely view resume by fetching with auth headers
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
            // Do not revoke immediately, browser needs time to load
        } catch (error) {
            alert("Failed to load resume.");
            console.error("View resume error:", error);
        }
    };

    useEffect(() => {
        if (!uid) {
            setLoading(false);
            return;
        }
        axiosClient
            .get(`/employers/by-user/${uid}`)
            .then(({ data }) => {
                const empId = data.employerId || data.id;
                setEmployerId(empId);

                return axiosClient.get(`/applications/employer/${empId}`);
            })
            .then(({ data }) => {
                setApplications(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error("Error fetching applications:", err);
                setApplications([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [uid]);

    const updateApplicationStatus = (applicationId, newStatus) => {
        axiosClient
            .put(`/applications/update/${applicationId}`, { status: newStatus })
            .then(() => {
                setApplications((prev) =>
                    prev.map((app) =>
                        app.applicationId === applicationId ? { ...app, status: newStatus } : app
                    )
                );
                alert(`Application ${newStatus.toLowerCase()} successfully!`);
            })
            .catch(() => {
                alert("Failed to update status");
            });
    };

    if (loading) return <div>Loading applications...</div>;

    return (
        <div className="container mt-4">
            <h2>Job Applications</h2>
            {applications.length === 0 ? (
                <div className="alert alert-info">
                    <h4>No Applications Yet</h4>
                    <p>You haven't received any job applications.</p>
                </div>
            ) : (
                <div className="row">
                    {applications.map((application) => (
                        <div key={application.applicationId} className="col-md-12 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h5 className="card-title">{application.jobTitle}</h5>
                                            <p className="card-text">
                                                <strong>Applicant:</strong> {application.applicantName}
                                                <br />
                                                <strong>Applied on:</strong> {application.applicationDate}
                                                <br />
                                                <strong>Status:</strong>{" "}
                                                <span
                                                    className={
                                                        application.status.toLowerCase() === "pending"
                                                            ? "badge bg-warning"
                                                            : application.status.toLowerCase() === "approved"
                                                                ? "badge bg-success"
                                                                : "badge bg-danger"
                                                    }
                                                >
                                                    {application.status}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            {application.status.toLowerCase() === "pending" && (
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => updateApplicationStatus(application.applicationId, "APPROVED")}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => updateApplicationStatus(application.applicationId, "REJECTED")}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {application.filePath && (
                                                <div className="mt-2">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => viewResume(application.filePath)}
                                                    >
                                                        View Resume
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

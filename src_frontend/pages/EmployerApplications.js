import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import * as mammoth from "mammoth";

export default function EmployerApplications() {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employerId, setEmployerId] = useState(null);

    // State to hold currently viewed job seeker profile
    const [viewingSeeker, setViewingSeeker] = useState(null);
    const [loadingSeeker, setLoadingSeeker] = useState(false);

    const uid = user?.userId || user?.id;

    // View Resume function (unchanged)
    const viewResume = async (filePath) => {
        if (!filePath) {
            alert("No resume available");
            return;
        }
        if (
            filePath.toLowerCase().endsWith(".docx") ||
            filePath.toLowerCase().endsWith(".doc")
        ) {
            try {
                const response = await axiosClient.get(`/resumes/download`, {
                    params: { path: filePath },
                    responseType: "arraybuffer",
                    headers: {
                        Accept:
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword",
                    },
                });
                const { value: html } = await mammoth.convertToHtml({
                    arrayBuffer: response.data,
                });
                const preview = window.open("", "_blank");
                preview.document.write(html);
                preview.document.close();
            } catch (err) {
                console.error("DOCX preview error:", err);
                alert("Failed to load DOCX preview.");
            }
            return;
        }
        try {
            const response = await axiosClient.get(`/resumes/download`, {
                params: { path: filePath },
                responseType: "arraybuffer",
                headers: {
                    Accept:
                        "application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword",
                },
            });
            const contentType = response.headers["content-type"] || "application/octet-stream";
            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
            }, 1000);
        } catch (error) {
            console.error("View resume error:", error);
            alert("Failed to load resume. Please try again.");
        }
    };

    // Fetch applications and employerId (unchanged)
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

    // Update application status (unchanged)
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

    // New: fetch and show job seeker profile
    const viewProfile = async (jobSeekerId) => {
        setLoadingSeeker(true);
        try {
            const { data } = await axiosClient.get(`/job-seekers/getbyid/${jobSeekerId}`);
            setViewingSeeker(data);
        } catch (err) {
            console.error("Error fetching job seeker profile:", err);
            alert("Failed to load job seeker profile.");
        } finally {
            setLoadingSeeker(false);
        }
    };

    const closeProfile = () => setViewingSeeker(null);

    if (loading) return <div>Loading applications...</div>;

    return (
        <div className="col-md-12 mb-3">
            <div className="card">
                <div className="card-body">
                    <h2>Job Applications</h2>
                </div>
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
                                                            onClick={() =>
                                                                updateApplicationStatus(application.applicationId, "APPROVED")
                                                            }
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                updateApplicationStatus(application.applicationId, "REJECTED")
                                                            }
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

                                                {/* View Profile Button */}
                                                <div className="mt-2">
                                                    <button
                                                        className="btn btn-outline-secondary btn-sm"
                                                        onClick={() => viewProfile(application.jobSeekerId)} // Ensure jobSeekerId exists on application
                                                    >
                                                        View Profile
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Seeker Profile Display */}
                                {viewingSeeker && viewingSeeker.jobSeekerId === application.jobSeekerId && (
                                    <div className="card mt-3">
                                        <div className="card-body">
                                            {loadingSeeker ? (
                                                <p>Loading profile...</p>
                                            ) : (
                                                <>
                                                    <h5>Applicant Profile</h5>
                                                    <p>
                                                        <strong>Name:</strong> {viewingSeeker.fullName}
                                                    </p>
                                                    <p>
                                                        <strong>Email:</strong> {viewingSeeker.email}
                                                    </p>
                                                    <p>
                                                        <strong>Phone:</strong> {viewingSeeker.phone}
                                                    </p>
                                                    <p>
                                                        <strong>Address:</strong> {viewingSeeker.address}
                                                    </p>
                                                    <p>
                                                        <strong>Education:</strong> {viewingSeeker.education}
                                                    </p>
                                                    <p>
                                                        <strong>Experience:</strong> {viewingSeeker.experience}
                                                    </p>
                                                    <button className="btn btn-sm btn-outline-secondary" onClick={closeProfile}>
                                                        Back to Applications
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

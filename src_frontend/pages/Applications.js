import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import * as mammoth from "mammoth";

export default function Applications() {
    const [applications, setApplications] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [jobSeekerId, setJobSeekerId] = useState(null);
    const [error, setError] = useState(null);

    const [showJobModal, setShowJobModal] = useState(false);
    const [jobDetails, setJobDetails] = useState(null);

    const viewResume = async (filePath) => {
        if (!filePath) {
            alert("No resume available");
            return;
        }
        if (
            filePath.toLowerCase().endsWith(".doc") ||
            filePath.toLowerCase().endsWith(".docx")
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
                responseType: "blob",
                headers: { Accept: "application/pdf" },
            });
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url);
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (err) {
            console.error("View resume error:", err);
            alert("Failed to load resume. Please try again.");
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
                if (!seekerId)
                    setError("Job seeker profile not found. Please complete your profile.");
            })
            .catch(() => setError("Unable to fetch job seeker profile."))
            .finally(() => setLoading(false));
    }, [user]);

    useEffect(() => {
        if (!jobSeekerId) return;
        axiosClient
            .get(`/applications/seeker/${jobSeekerId}`)
            .then(({ data }) => {
                const arr = Array.isArray(data) ? data : data ? [data] : [];
                setApplications(
                    arr.map((app) => {
                        const jobListing = app.jobListing || {};
                        return {
                            applicationId: app.applicationId || app.id,
                            jobListingId: app.jobListingId || jobListing.id,
                            jobTitle: jobListing.title || app.jobTitle || "N/A",
                            companyName: jobListing.companyName || app.companyName || "N/A",
                            applicationDate: app.applicationDate,
                            status: app.status || "Applied",
                            filePath: app.filePath || "",
                            jobListing,
                        };
                    })
                );
            })
            .catch((err) => {
                if (err.response?.status === 404) setApplications([]);
                else setError("Error fetching applications.");
            });
    }, [jobSeekerId]);

    const handleShowJobDetails = async (listingId, jobListingData) => {
        if (jobListingData && Object.keys(jobListingData).length > 0) {
            setJobDetails(jobListingData);
            setShowJobModal(true);
            return;
        }
        try {
            const resp = await axiosClient.get(`/job-listings/getbyid/${listingId}`);
            setJobDetails(resp.data);
            setShowJobModal(true);
        } catch {
            alert("Job detail could not be loaded.");
        }
    };

    if (!user?.id && !user?.userId) return <div>Loading user info...</div>;
    if (loading) return <div>Loading applications...</div>;
    if (error)
        return (
            <div className="container mt-4">
                <h2>My Applications</h2>
                <div className="alert alert-danger">
                    <p>{error}</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => (window.location.href = "/profile")}
                    >
                        Complete Profile
                    </button>
                </div>
            </div>
        );

    return (
        <div className="container mt-4">
            {/* Parent Card for Applications */}
            <div className="card">
                <div className="card-header">
                    <h2>My Applications</h2>
                </div>
                <div className="card-body">
                    <div style={{ fontSize: 12, marginBottom: 10 }}>
                        <strong>Debug Info:</strong>
                        <br />
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
                                    <div className="card position-relative">
                                        <button
                                            className="btn btn-light position-absolute"
                                            style={{
                                                top: 10,
                                                right: 10,
                                                borderRadius: "50%",
                                                padding: "0.35rem 0.5rem",
                                                fontWeight: "bold",
                                            }}
                                            aria-label="Info"
                                            title="View Job Details"
                                            onClick={() => handleShowJobDetails(app.jobListingId, app.jobListing)}
                                        >
                                            i
                                        </button>
                                        <div className="card-body">
                                            <h5 className="card-title mb-1">{app.jobTitle}</h5>
                                            <div
                                                className="text-muted mb-2"
                                                style={{ fontSize: "0.97em" }}
                                            >
                                                <b>Company:</b> {app.companyName}
                                            </div>
                                            <p className="card-text mb-1">
                                                <strong>Applied on:</strong> {app.applicationDate}
                                            </p>
                                            <p className="card-text mb-2">
                                                <strong>Status:</strong>{" "}
                                                <span
                                                    className={`badge ms-2 ${app.status.toLowerCase() === "pending"
                                                        ? "bg-warning"
                                                        : app.status.toLowerCase() === "accepted" ||
                                                            app.status.toLowerCase() === "approved"
                                                            ? "bg-success"
                                                            : "bg-danger"
                                                        }`}
                                                >
                                                    {app.status.toLowerCase() === "pending"
                                                        ? "Applied"
                                                        : app.status}
                                                </span>
                                            </p>
                                            <small className="text-muted">
                                                Application ID: {app.applicationId} &nbsp;|&nbsp; Job ID: {app.jobListingId}
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
                                                    <span
                                                        style={{
                                                            marginLeft: 10,
                                                            fontSize: "0.8em",
                                                            color: "#666",
                                                        }}
                                                    >
                                                        {app.filePath.split(/[\\/]/).pop()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div style={{ color: "#aaa", marginTop: 8 }}>
                                                    No Resume Attached
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showJobModal && jobDetails && (
                <div
                    className="modal d-block"
                    style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
                    tabIndex="-1"
                    role="dialog"
                >
                    <div className="modal-dialog" role="document">
                        <div className="modal-content p-4">
                            <h5 className="modal-title mb-2">
                                {jobDetails.title || "Job Details"}
                            </h5>
                            <div className="mb-2">
                                <strong>Company:</strong>{" "}
                                {jobDetails.companyName || "N/A"}
                            </div>
                            <div className="mb-2">
                                <strong>Location:</strong> {jobDetails.location || "N/A"}
                            </div>
                            <div className="mb-2">
                                <strong>Job Type:</strong> {jobDetails.jobType || "N/A"}
                            </div>
                            <div className="mb-2">
                                <strong>Posted Date:</strong> {jobDetails.postedDate || "N/A"}
                            </div>
                            <div className="mb-2">
                                <strong>Description:</strong>
                                <div>{jobDetails.description || "N/A"}</div>
                            </div>
                            <div className="mb-2">
                                <strong>Qualifications:</strong>
                                <div>{jobDetails.qualifications || "N/A"}</div>
                            </div>
                            <div className="mb-2">
                                <strong>Required Skills:</strong>
                                <div>{jobDetails.requiredSkills || "N/A"}</div>
                            </div>
                            <button
                                className="btn btn-secondary mt-2"
                                onClick={() => setShowJobModal(false)}
                            >
                                Back to Applications
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

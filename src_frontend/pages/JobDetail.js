import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [employerId, setEmployerId] = useState(null);
    const [jobSeekerId, setJobSeekerId] = useState(null);

    // Fetch employer info
    useEffect(() => {
        if (!user?.userId && !user?.id) return;
        const uid = user?.userId || user?.id;
        if (user?.roles?.includes("employer")) {
            axiosClient
                .get(`/employers/by-user/${uid}`)
                .then(({ data }) => setEmployerId(data.employerId || data.id))
                .catch((err) => console.error("Failed to fetch employer info:", err));
        }
    }, [user]);

    // Fetch job seeker id for job seeker role
    useEffect(() => {
        if (!user || !user?.roles.includes("job_seeker")) return;
        const jobSeekerIdValue = user.userId || user.id;
        axiosClient
            .get(`/job-seekers/by-user/${jobSeekerIdValue}`)
            .then(({ data }) => setJobSeekerId(data.jobSeekerId || data.id))
            .catch(() => setJobSeekerId(null));
    }, [user]);

    // Fetch job details
    useEffect(() => {
        axiosClient
            .get(`/job-listings/getbyid/${id}`)
            .then(({ data }) => setJob(data))
            .catch((err) => console.error("Error fetching job:", err));
    }, [id]);

    // Delete Job (Employer)
    const deleteJob = async () => {
        if (!window.confirm(`Are you sure you want to delete "${job.title}"?`)) return;
        try {
            await axiosClient.delete(`/job-listings/delete/${id}`);
            alert("Job deleted successfully");
            navigate("/employer/manage-jobs");
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete job");
        }
    };

    // Apply for Job (Job Seeker)
    const applyForJob = async (jobListingId) => {
        if (!jobSeekerId) {
            alert("Please complete your profile first!");
            return;
        }
        try {
            const { data: resumeData } = await axiosClient.get(`/resumes/by-user/${jobSeekerId}`);
            const filePath = resumeData?.filePath;
            if (!filePath) {
                alert("Please upload your resume before applying.");
                return;
            }
            const payload = {
                jobSeekerId,
                jobListingId,
                status: "pending",
                applicationDate: new Date().toISOString().slice(0, 10),
                filePath,
            };
            await axiosClient.post("/applications/apply", payload);
            alert("Application submitted successfully!");
        } catch (error) {
            if (error.response?.status === 404) {
                alert("Please upload your resume before applying.");
            } else {
                alert(error.response?.data?.message || "Failed to submit application.");
            }
        }
    };

    if (!job) return <p>Loading...</p>;

    const isOwner = user?.roles?.includes("employer") && employerId && job.employerId === employerId;
    const isJobSeeker = user?.roles?.includes("job_seeker");

    return (
        <div className="container mt-4">
            <button className="btn-back mb-3" onClick={() => navigate(-1)}>
                &larr; Back
            </button>

            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3>{job.title}</h3>
                    {isOwner && (
                        <div>
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => navigate("/employer/manage-jobs")}
                            >
                                Edit
                            </button>
                            <button className="btn btn-outline-danger btn-sm" onClick={deleteJob}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>

                <div className="card-body">
                    <div className="profile-fields">
                        {[
                            { label: "Company", value: job.companyName },
                            { label: "Location", value: job.location },
                            { label: "Experience", value: job.experience },
                            { label: "Job Type", value: job.jobType },
                            { label: "Salary", value: `$${job.salary}` },
                            { label: "Posted Date", value: job.postedDate },
                            { label: "Required Skills", value: job.requiredSkills },
                        ].map((field, idx) => (
                            <div key={idx} className="profile-row">
                                <div className="profile-label">{field.label}:</div>
                                <div className="profile-value">{field.value || "N/A"}</div>
                            </div>
                        ))}

                        <div className="profile-row">
                            <div className="profile-label">Job Description:</div>
                            <div className="profile-value">{job.description}</div>
                        </div>

                        <div className="profile-row">
                            <div className="profile-label">Qualifications:</div>
                            <div className="profile-value">{job.qualifications}</div>
                        </div>
                    </div>

                    {isJobSeeker && (
                        <div className="card mt-3">
                            <div className="card-body text-center">
                                <h6>Interested in this position?</h6>
                                <button
                                    className="btn btn-success"
                                    onClick={() => applyForJob(job.jobListingId || job.id)}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

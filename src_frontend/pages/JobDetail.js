import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [employerId, setEmployerId] = useState(null);

    useEffect(() => {
        if (!user?.userId && !user?.id) return;
        const uid = user?.userId || user?.id;
        if (user?.roles?.includes("employer")) {
            axiosClient
                .get(`/employers/by-user/${uid}`)
                .then(({ data }) => {
                    setEmployerId(data.employerId || data.id);
                })
                .catch((err) => {
                    console.error("Failed to fetch employer info:", err);
                });
        }
    }, [user]);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await axiosClient.get(`/job-listings/getbyid/${id}`);
                setJob(data);
            } catch (err) {
                console.error("Error fetching job:", err);
            }
        })();
    }, [id]);

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

    const updateJob = async () => {
        try {
            const jobPayload = {
                ...job,
                employerId: job.employerId,
            };

            await axiosClient.put(`/job-listings/update/${id}`, jobPayload);
            alert("Job updated successfully");
            setEditMode(false);
        } catch (err) {
            console.error("Update failed", err);
            alert("Failed to update job: " + (err.response?.data?.message || err.message));
        }
    };

    const cancelEdit = () => {
        axiosClient.get(`/job-listings/getbyid/${id}`)
            .then(({ data }) => {
                setJob(data);
                setEditMode(false);
            })
            .catch((err) => {
                console.error("Error reloading job:", err);
            });
    };

    if (!job) return <p>Loading...</p>;

    const isOwner = user?.roles?.includes("employer") && employerId && job.employerId === employerId;

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3>{editMode ? "Edit Job" : job.title}</h3>
                    {isOwner && (
                        <div>
                            {!editMode ? (
                                <>
                                    <button
                                        className="btn btn-outline-primary btn-sm me-2"
                                        onClick={() => setEditMode(true)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={deleteJob}
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-success btn-sm me-2"
                                        onClick={updateJob}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-8">
                            {editMode ? (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label"><strong>Job Title:</strong></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={job.title}
                                            onChange={(e) => setJob({ ...job, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Company:</strong></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={job.companyName || ""}
                                            onChange={(e) => setJob({ ...job, companyName: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Location:</strong></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={job.location}
                                            onChange={(e) => setJob({ ...job, location: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Experience</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={job.experience || ""}
                                            onChange={e => setJob({ ...job, experience: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Job Type:</strong></label>
                                        <select
                                            className="form-select"
                                            value={job.jobType || ""}
                                            onChange={(e) => setJob({ ...job, jobType: e.target.value })}
                                        >
                                            <option value="">Select Job Type</option>
                                            <option value="Full-Time">Full-Time</option>
                                            <option value="Intern">Intern</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Salary:</strong></label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={job.salary}
                                            onChange={(e) => setJob({ ...job, salary: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Posted Date:</strong></label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={job.postedDate || ""}
                                            onChange={(e) => setJob({ ...job, postedDate: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Job Description:</strong></label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={job.description}
                                            onChange={(e) => setJob({ ...job, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Qualifications:</strong></label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={job.qualifications}
                                            onChange={(e) => setJob({ ...job, qualifications: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label"><strong>Required Skills:</strong></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={job.requiredSkills || ""}
                                            onChange={(e) => setJob({ ...job, requiredSkills: e.target.value })}
                                            placeholder="Comma separated skills"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p><strong>Company:</strong> {job.companyName || "N/A"}</p>
                                    <p><strong>Location:</strong> {job.location}</p>
                                    <p><strong>Experience:</strong> {job.experience || "N/A"}</p>
                                    <p><strong>Job Type:</strong> {job.jobType || "N/A"}</p>
                                    <p><strong>Salary:</strong> ${job.salary}</p>
                                    <p><strong>Posted Date:</strong> {job.postedDate || "N/A"}</p>
                                    <p><strong>Required Skills:</strong> {job.requiredSkills || "N/A"}</p>

                                    <h5>Job Description:</h5>
                                    <p>{job.description}</p>

                                    <h5>Qualifications:</h5>
                                    <p>{job.qualifications}</p>
                                </>
                            )}
                        </div>
                        <div className="col-md-4">
                            {user?.roles?.includes("job_seeker") && !editMode && (
                                <div className="card">
                                    <div className="card-body text-center">
                                        <h6>Interested in this position?</h6>
                                        <button className="btn btn-success">
                                            Apply Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

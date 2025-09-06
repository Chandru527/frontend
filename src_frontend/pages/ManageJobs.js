import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function ManageJobs() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [employerId, setEmployerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingJobId, setEditingJobId] = useState(null);
    const [jobForm, setJobForm] = useState(null);

    useEffect(() => {
        if (!user?.userId && !user?.id) return;

        const uid = user?.userId || user?.id;
        axiosClient
            .get(`/employers/by-user/${uid}`)
            .then(({ data }) => {
                setEmployerId(data.employerId || data.id);
            })
            .catch((err) => {
                console.error("Failed to fetch employer info:", err);
            })
            .finally(() => setLoading(false));
    }, [user]);

    const loadMyJobs = async () => {
        if (!employerId) return;

        try {
            const { data } = await axiosClient.get(`/job-listings/employer/${employerId}`);
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching my jobs:", err);
            setJobs([]);
        }
    };

    useEffect(() => {
        if (employerId) {
            loadMyJobs();
        }
    }, [employerId]);

    const deleteJob = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await axiosClient.delete(`/job-listings/delete/${id}`);
            alert("Job deleted successfully");
            loadMyJobs();
        } catch (err) {
            console.error("Error deleting job:", err);
            alert("Error deleting job");
        }
    };

    const editJob = (job) => {
        setEditingJobId(job.jobListingId);
        setJobForm({ ...job });
    };

    const cancelEdit = () => {
        setEditingJobId(null);
        setJobForm(null);
    };

    const saveJob = async () => {
        try {
            if (!jobForm) return;

            const jobPayload = {
                title: jobForm.title,
                companyName: jobForm.companyName,
                location: jobForm.location,
                experience: jobForm.experience,
                jobType: jobForm.jobType,
                salary: jobForm.salary,
                postedDate: jobForm.postedDate,
                description: jobForm.description,
                qualifications: jobForm.qualifications,
                requiredSkills: jobForm.requiredSkills,
                employerId: employerId,
                jobListingId: jobForm.jobListingId,
            };

            await axiosClient.put(`/job-listings/update/${jobForm.jobListingId}`, jobPayload);

            alert("Job updated successfully");
            setEditingJobId(null);
            setJobForm(null);
            loadMyJobs();
        } catch (err) {
            console.error("Error updating job:", err);
            alert("Failed to update job: " + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-body">
                    <h2>Manage My Jobs</h2>
                </div>

                {jobs.length === 0 ? (
                    <div className="alert alert-info">
                        <p>You haven't posted any jobs yet.</p>
                        <button className="btn btn-primary" onClick={() => (window.location.href = "/employer/dashboard")}>
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className="row">
                        {jobs.map((j) => (
                            <div key={j.jobListingId} className="col-md-12 mb-3">
                                <div className="card shadow-sm border-0">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-8">
                                                {editingJobId === j.jobListingId ? (
                                                    <>
                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Job Title:</strong></label>
                                                            <input type="text" className="form-control" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Company:</strong></label>
                                                            <input type="text" className="form-control" value={jobForm.companyName || ""} onChange={(e) => setJobForm({ ...jobForm, companyName: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Location:</strong></label>
                                                            <input type="text" className="form-control" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label">Experience</label>
                                                            <input type="text" className="form-control" value={jobForm.experience || ""} onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Job Type:</strong></label>
                                                            <select className="form-select" value={jobForm.jobType || ""} onChange={(e) => setJobForm({ ...jobForm, jobType: e.target.value })}>
                                                                <option value="">Select Job Type</option>
                                                                <option value="Full-Time">Full-Time</option>
                                                                <option value="Intern">Intern</option>
                                                            </select>
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Salary:</strong></label>
                                                            <input type="number" className="form-control" value={jobForm.salary} onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Posted Date:</strong></label>
                                                            <input type="date" className="form-control" value={jobForm.postedDate || ""} onChange={(e) => setJobForm({ ...jobForm, postedDate: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Job Description:</strong></label>
                                                            <textarea className="form-control" rows="5" value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Qualifications:</strong></label>
                                                            <textarea className="form-control" rows="4" value={jobForm.qualifications} onChange={(e) => setJobForm({ ...jobForm, qualifications: e.target.value })} />
                                                        </div>

                                                        <div className="mb-3">
                                                            <label className="form-label"><strong>Required Skills:</strong></label>
                                                            <input type="text" className="form-control" value={jobForm.requiredSkills || ""} onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })} placeholder="Comma separated skills" />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="job-details-card p-3 border rounded bg-light">
                                                        <h5 className="card-title text-primary">{j.title}</h5>
                                                        <p className="card-text">
                                                            <strong>Location:</strong> {j.location}
                                                            <br />
                                                            <strong>Salary:</strong> ${j.salary}
                                                            <br />
                                                            <strong>Company:</strong> {j.companyName || "N/A"}
                                                            <br />
                                                            <strong>Job Type:</strong> {j.jobType || "N/A"}
                                                            <br />
                                                            <strong>Experience:</strong> {j.experience || "N/A"}
                                                            <br />
                                                            <strong>Required Skills:</strong> {j.requiredSkills || "N/A"}
                                                            <br />
                                                            <strong>Posted:</strong> {j.postedDate || "N/A"}
                                                        </p>
                                                        <p className="text-muted">{j.description}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-4 text-end">
                                                <div className="btn-group-vertical" role="group">
                                                    {editingJobId === j.jobListingId ? (
                                                        <>
                                                            <button className="btn btn-success btn-sm mb-2" onClick={saveJob}>
                                                                Save
                                                            </button>
                                                            <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                                                                Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button className="btn btn-outline-primary btn-sm mb-2" onClick={() => editJob(j)}>
                                                                Edit Job
                                                            </button>
                                                            <button className="btn btn-outline-danger btn-sm" onClick={() => deleteJob(j.jobListingId, j.title)}>
                                                                Delete Job
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function ManageJobs() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [employerId, setEmployerId] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const editJob = (jobId) => {
        navigate(`/jobs/${jobId}`, { state: { edit: true } });
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <h2>Manage My Jobs</h2>

            {jobs.length === 0 ? (
                <div className="alert alert-info">
                    <p>You haven't posted any jobs yet.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/employer/dashboard')}
                    >
                        Post Your First Job
                    </button>
                </div>
            ) : (
                <div className="row">
                    {jobs.map((j) => (
                        <div key={j.jobListingId} className="col-md-12 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h5 className="card-title">{j.title}</h5>
                                            <p className="card-text">
                                                <strong>Location:</strong> {j.location}<br />
                                                <strong>Salary:</strong> ${j.salary}<br />
                                                <strong>Company:</strong> {j.companyName || "N/A"}<br />
                                                <strong>Job Type:</strong> {j.jobType || "N/A"}<br />
                                                <strong>Experience:</strong> {j.experience || "N/A"}<br />
                                                <strong>Required Skills:</strong> {j.requiredSkills || "N/A"}<br />
                                                <strong>Posted:</strong> {j.postedDate || "N/A"}
                                            </p>
                                            <p className="text-muted">{j.description}</p>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <div className="btn-group-vertical" role="group">
                                                <button
                                                    className="btn btn-outline-primary btn-sm mb-2"
                                                    onClick={() => editJob(j.jobListingId)}
                                                >
                                                    Edit Job
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm"
                                                    onClick={() => deleteJob(j.jobListingId, j.title)}
                                                >
                                                    Delete Job
                                                </button>
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
    );
}

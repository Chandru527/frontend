import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Recommendations() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Recommendations - user object:", user);
        console.log("Recommendations - jobSeekerId:", user?.jobSeekerId);
        if (!user?.jobSeekerId) {
            console.warn("Job seeker ID not available, skipping recommendations fetch.");
            setLoading(false);
            return;
        }
        axiosClient
            .get(`/jobsearches/recommend/user/${user.jobSeekerId}`)
            .then(({ data }) => setJobs(data))
            .catch((err) => {
                console.error("Failed to load recommendations", err);
                setError("Failed to load recommendations. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) {
        return <p>Loading recommendations…</p>;
    }

    return (
        <div className="container mt-4">
            <h2>Your Job Recommendations</h2>
            {error && <p className="text-danger">{error}</p>}
            {jobs.length === 0 ? (
                <p>No recommendations at this time.</p>
            ) : (
                jobs.map((job) => (
                    <div key={job.jobListingId} className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">{job.title || "No title provided"}</h5>
                            <p>
                                <strong>Company:</strong> {job.companyName || "Not specified"}
                            </p>
                            <p>
                                <strong>Location:</strong> {job.location || "Not specified"}
                            </p>
                            <p>
                                <strong>Qualifications:</strong> {job.qualifications || "Not specified"}
                            </p>
                            <p>
                                <strong>Required Skills:</strong> {job.requiredSkills || "Not specified"}
                            </p>
                            <p>
                                <strong>Job Type:</strong> {job.jobType || "Not specified"}
                            </p>
                            <p>
                                <strong>Experience:</strong> {job.experience || "Not specified"}
                            </p>
                            <p>
                                <strong>Salary:</strong> {job.salary ? `$${job.salary}` : "Not specified"}
                            </p>
                            <p>
                                <strong>Posted Date:</strong> {job.postedDate || "Not specified"}
                            </p>
                            <p>{job.description || "No description provided."}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

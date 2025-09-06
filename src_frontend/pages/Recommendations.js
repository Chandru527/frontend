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
                jobs.map((job) => {
                    const { matchedLocation, matchedQualification } = job; // Assumed flags

                    // Prepare badges array
                    const badges = [];
                    if (matchedLocation) {
                        badges.push(
                            <span key="loc" className="badge bg-success ms-2" title="Matched by location">
                                Location Match
                            </span>
                        );
                    }
                    if (matchedQualification) {
                        badges.push(
                            <span key="qual" className="badge bg-info ms-2" title="Matched by qualification">
                                Qualification Match
                            </span>
                        );
                    }

                    // Card border color based on matches
                    let borderColor = "";
                    if (matchedLocation && matchedQualification) borderColor = "#0d6efd";
                    else if (matchedLocation) borderColor = "#198754";
                    else if (matchedQualification) borderColor = "#0dcaf0";

                    return (
                        <div
                            key={job.jobId || job.jobListingId}
                            className="card mb-3"
                            style={{
                                borderWidth: matchedLocation || matchedQualification ? "3px" : "1px",
                                borderColor: borderColor || undefined,
                                borderStyle: matchedLocation || matchedQualification ? "solid" : undefined,
                            }}
                        >
                            <div className="card-body">
                                <h5>
                                    {job.title || "No title provided"}
                                    {badges}
                                </h5>
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
                    );
                })
            )}
        </div>
    );
}

import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function EmployerDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [employerId, setEmployerId] = useState(null);
    const [employerLoading, setEmployerLoading] = useState(true);
    const [newJob, setNewJob] = useState({
        title: "",
        description: "",
        location: "",
        salary: 0,
        qualifications: "",
        postedDate: "",
        jobType: "",
        companyName: "",
        experience: "",
        requiredSkills: "", // <-- Added here
    });

    // Fetch employer info and set employerId
    useEffect(() => {
        if (!user?.userId && !user?.id) return;
        const uid = user?.userId || user?.id;
        setEmployerLoading(true);
        axiosClient
            .get(`/employers/by-user/${uid}`)
            .then(({ data }) => {
                setEmployerId(data.employerId || data.id);
                // Pre-fill company name from employer profile but allow editing
                setNewJob((prev) => ({
                    ...prev,
                    companyName: data.companyName || "",
                }));
            })
            .catch((err) => {
                console.error("Failed to fetch employer info:", err);
            })
            .finally(() => setEmployerLoading(false));
    }, [user]);

    // Fetch ONLY this employer's job listings, not all jobs
    const fetchMyJobs = async () => {
        if (!employerId) return;
        try {
            const { data } = await axiosClient.get(`/job-listings/employer/${employerId}`);
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching my jobs:", err);
            setJobs([]);
        }
    };

    // Fetch jobs when employerId is available
    useEffect(() => {
        if (employerId) {
            fetchMyJobs();
        }
    }, [employerId]);

    const createJob = async () => {
        if (employerLoading) {
            alert("Loading employer info, please wait...");
            return;
        }
        if (!employerId) {
            alert("Unable to determine employer ID. Please refresh and try again.");
            return;
        }
        try {
            // Add validation if desired:
            // if (!newJob.requiredSkills.trim()) {
            //     alert("Required Skills are mandatory!");
            //     return;
            // }

            const jobPayload = {
                ...newJob,
                employerId: employerId,
            };

            await axiosClient.post("/job-listings/create", jobPayload);
            alert("Job created successfully");

            setNewJob((prev) => ({
                title: "",
                description: "",
                location: "",
                salary: 0,
                qualifications: "",
                postedDate: "",
                jobType: "",
                companyName: prev.companyName,
                experience: "",
                requiredSkills: "", // <-- Reset field after creation
            }));

            fetchMyJobs();
        } catch (err) {
            console.error("Post failed:", err.response?.data || err.message);
            alert("Post failed: " + (err.response?.data?.message || err.message));
        }
    };

    if (employerLoading) {
        return <div>Loading employer dashboard...</div>;
    }

    return (
        <div className="container mt-4">
            <h3>Employer Dashboard</h3>

            <div className="card mb-4">
                <div className="card-header">
                    <h5>Create Job Listing</h5>
                </div>
                <div className="card-body">
                    <div className="mb-3">
                        <input
                            placeholder="Job Title"
                            value={newJob.title}
                            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <textarea
                            placeholder="Job Description"
                            value={newJob.description}
                            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                            className="form-control"
                            rows="3"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            placeholder="Qualifications"
                            value={newJob.qualifications}
                            onChange={(e) => setNewJob({ ...newJob, qualifications: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            placeholder="Required Skills (comma separated)"
                            value={newJob.requiredSkills}
                            onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            placeholder="Location"
                            value={newJob.location}
                            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="number"
                            placeholder="Salary"
                            value={newJob.salary}
                            onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            placeholder="Company Name"
                            value={newJob.companyName}
                            onChange={(e) => setNewJob({ ...newJob, companyName: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            placeholder="Experience"
                            value={newJob.experience}
                            onChange={e => setNewJob({ ...newJob, experience: e.target.value })}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <select
                            value={newJob.jobType}
                            onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                            className="form-select"
                            required
                        >
                            <option value="">Select Job Type</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Intern">Intern</option>
                            {/* <option value="Part-Time">Part-Time</option> */}
                            {/* <option value="Contract">Contract</option> */}
                        </select>
                    </div>
                    <div className="mb-3">
                        <input
                            type="date"
                            placeholder="Posted Date"
                            value={newJob.postedDate}
                            onChange={(e) => setNewJob({ ...newJob, postedDate: e.target.value })}
                            className="form-control"
                        />
                    </div>
                    <button
                        onClick={createJob}
                        className="btn btn-primary"
                        disabled={employerLoading || !employerId}
                    >
                        Post Job
                    </button>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h5>My Job Listings ({jobs.length})</h5>
                </div>
                <div className="card-body">
                    {jobs.length === 0 ? (
                        <p className="text-muted">You haven't posted any jobs yet.</p>
                    ) : (
                        jobs.map((j) => (
                            <div key={j.jobListingId} className="border-bottom pb-3 mb-3">
                                <h6><strong>{j.title}</strong></h6>
                                <p className="mb-1"><strong>Location:</strong> {j.location}</p>
                                <p className="mb-1"><strong>Salary:</strong> ${j.salary}</p>
                                <p className="mb-1"><strong>Company:</strong> {j.companyName || "N/A"}</p>
                                <p className="mb-1"><strong>Job Type:</strong> {j.jobType || "N/A"}</p>
                                <p className="mb-1"><strong>Required Skills:</strong> {j.requiredSkills || "N/A"}</p>
                                <p className="mb-1"><strong>Posted:</strong> {j.postedDate || "N/A"}</p>
                                <small className="text-muted">{j.description}</small>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

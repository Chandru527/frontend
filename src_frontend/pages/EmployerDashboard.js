import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function EmployerDashboard() {
    const [jobs, setJobs] = useState([]);
    const [newJob, setNewJob] = useState({
        title: "",
        description: "",
        location: "",
        salary: 0,
        qualifications: "",
        employerId: "",
        postedDate: ""
    });

    const fetchJobs = async () => {
        const { data } = await axiosClient.get("/job-listings/getall");
        setJobs(data);
    };

    useEffect(() => { fetchJobs(); }, []);

    const createJob = async () => {
        try {
            await axiosClient.post("/job-listings/create", newJob);
            alert("✅ Job created successfully");
            setNewJob({
                title: "",
                description: "",
                location: "",
                salary: 0,
                qualifications: "",
                employerId: "",
                postedDate: ""
            });
            fetchJobs();
        } catch (err) {
            console.error("❌ Post failed:", err.response?.data || err.message);
            alert("Post failed: " + JSON.stringify(err.response?.data));
        }
    };

    return (
        <div>
            <h3>Employer Dashboard</h3>

            <h5>Create Job Listing</h5>
            <input
                placeholder="Title"
                value={newJob.title}
                onChange={e => setNewJob({ ...newJob, title: e.target.value })}
            /><br />
            <input
                placeholder="Description"
                value={newJob.description}
                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
            /><br />
            <input
                placeholder="Qualifications"
                value={newJob.qualifications}
                onChange={e => setNewJob({ ...newJob, qualifications: e.target.value })}
            /><br />
            <input
                placeholder="Location"
                value={newJob.location}
                onChange={e => setNewJob({ ...newJob, location: e.target.value })}
            /><br />
            <input
                type="number"
                placeholder="Salary"
                value={newJob.salary}
                onChange={e => setNewJob({ ...newJob, salary: e.target.value })}
            /><br />
            <input
                type="number"
                placeholder="Employer ID"
                value={newJob.employerId}
                onChange={e => setNewJob({ ...newJob, employerId: e.target.value })}
            /><br />
            <input
                type="date"
                placeholder="Posted Date"
                value={newJob.postedDate}
                onChange={e => setNewJob({ ...newJob, postedDate: e.target.value })}
            /><br />

            <button onClick={createJob}>Post Job</button>

            <h5 className="mt-3">My Job Listings</h5>
            {jobs.map(j => (
                <div key={j.jobListingId}>
                    <b>{j.title}</b> – {j.location} (${j.salary})
                </div>
            ))}
        </div>
    );
}

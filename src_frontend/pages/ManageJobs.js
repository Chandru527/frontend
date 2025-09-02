import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ManageJobs() {
    const [jobs, setJobs] = useState([]);

    const loadJobs = async () => {
        const { data } = await axiosClient.get("/job-listings/getall");
        setJobs(data);
    };

    const deleteJob = async (id) => {
        try {
            await axiosClient.delete(`/job-listings/delete/${id}`);
            loadJobs();
        } catch (err) {
            alert("Error deleting job");
        }
    };

    useEffect(() => { loadJobs(); }, []);

    return (
        <div>
            <h2>Manage My Jobs</h2>
            {jobs.map(j => (
                <div key={j.id} className="border p-2 mb-2">
                    <h5>{j.title}</h5>
                    <button onClick={() => deleteJob(j.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
            ))}
        </div>
    );
}

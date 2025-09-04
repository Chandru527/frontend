import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function JobDetail() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();
    const { hasRole } = useAuth();

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
        try {
            await axiosClient.delete(`/job-listings/delete/${id}`);
            alert("Job deleted successfully");
            navigate("/employer/dashboard");
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const updateJob = async () => {
        try {
            await axiosClient.put(`/job-listings/update/${id}`, job);
            alert("Job updated successfully");
            setEditMode(false);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    if (!job) return <p>Loading...</p>;

    return (
        <div>
            <h3>Job Detail</h3>

            {editMode ? (
                <>
                    <input
                        type="text"
                        value={job.title}
                        onChange={(e) => setJob({ ...job, title: e.target.value })}
                        placeholder="Title"
                    />
                    <input
                        type="text"
                        value={job.location}
                        onChange={(e) => setJob({ ...job, location: e.target.value })}
                        placeholder="Location"
                    />
                    <input
                        type="number"
                        value={job.salary}
                        onChange={(e) => setJob({ ...job, salary: e.target.value })}
                        placeholder="Salary"
                    />
                    <textarea
                        value={job.description}
                        onChange={(e) => setJob({ ...job, description: e.target.value })}
                        placeholder="Description"
                    />
                    <input
                        type="text"
                        value={job.companyName || ""}
                        onChange={(e) => setJob({ ...job, companyName: e.target.value })}
                        placeholder="Company Name"
                    />
                    <select
                        value={job.jobType || ""}
                        onChange={(e) => setJob({ ...job, jobType: e.target.value })}
                        required
                        className="form-select mt-2 mb-3"
                    >
                        <option value="">Select Job Type</option>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Intern">Intern</option>
                    </select>
                    <br />
                    <button onClick={updateJob}>Save</button>
                    <button onClick={() => setEditMode(false)}>Cancel</button>
                </>
            ) : (
                <>
                    <h4>{job.title}</h4>
                    <p>
                        <b>Location:</b> {job.location}
                    </p>
                    <p>
                        <b>Salary:</b> {job.salary}
                    </p>
                    <p>
                        <b>Description:</b> {job.description}
                    </p>
                    <p>
                        <b>Company:</b> {job.companyName || "N/A"}
                    </p>
                    <p>
                        <b>Job Type:</b> {job.jobType || "N/A"}
                    </p>
                </>
            )}

            {hasRole(["employer"]) && (
                <div>
                    {!editMode && <button onClick={() => setEditMode(true)}>Update</button>}
                    <button onClick={deleteJob}>Delete</button>
                </div>
            )}
        </div>
    );
}

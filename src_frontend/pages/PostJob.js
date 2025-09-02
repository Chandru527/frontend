import { useForm } from "react-hook-form";
import axiosClient from "../api/axiosClient";

export default function PostJob() {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            await axiosClient.post("/job-listings/create", data);
            alert("Job posted successfully!");
            reset();
        } catch (err) {
            alert("Error posting job: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            <h2>Post a Job</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("title")} placeholder="Title" className="form-control mb-2" />
                <input {...register("location")} placeholder="Location" className="form-control mb-2" />
                <textarea {...register("description")} placeholder="Description" className="form-control mb-2" />
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}

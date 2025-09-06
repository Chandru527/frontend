import React from "react";
import { NavLink } from "react-router-dom";
import "../styles.css"; // CSS handles background

const Home = () => (
    <div className="home-container d-flex flex-column justify-content-center align-items-center text-center">
        <h1 className="display-4 fw-bold text-light mb-3">
            Welcome to <span className="brand-text">CareerCrafter</span>
        </h1>
        <p className="lead text-light mb-4">
            Your platform to explore jobs, manage resumes, and grow your career.
        </p>
        <div>
            <NavLink to="/login" className="btn btn-primary me-3 home-btn">
                Explore jobs
            </NavLink>
            <NavLink to="/register" className="btn btn-outline-light home-btn">
                Join Now
            </NavLink>
        </div>
    </div>
);

export default Home;

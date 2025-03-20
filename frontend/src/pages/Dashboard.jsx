import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { principal, user } = location.state || {};

  if (!principal || !user) {
    alert("Invalid access. Please log in.");
    navigate("/");
    return null;
  }

  const logout = () => {
    alert("To fully disconnect, go to Plug Wallet and disconnect manually.");
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Your Dashboard</h1>
      <p><strong>Principal:</strong> {principal}</p>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Mobile:</strong> {user.mobile}</p>
      <p><strong>Address:</strong> {user.address}</p>
      <p><strong>Gender:</strong> {user.gender}</p>
      <p><strong>Birthday:</strong> {user.dob}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;

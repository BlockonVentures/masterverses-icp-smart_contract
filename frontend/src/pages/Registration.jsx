import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../declarations/auth-did-backend";
import { Principal } from "@dfinity/principal";

const Register = () => {
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", mobile: "", address: "", gender: "", birthday: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerUser = async () => {
    setLoading(true);

    try {
      // ✅ Step 1: Ensure Plug Wallet is connected
      if (!window.ic || !window.ic.plug) {
        alert("Plug Wallet not found. Please install it.");
        setLoading(false);
        return;
      }

      // ✅ Step 2: Request Plug Wallet Connection if Not Connected
      const connected = await window.ic.plug.isConnected();
      if (!connected) {
        const success = await window.ic.plug.requestConnect({
          whitelist: [process.env.REACT_APP_AUTH_DID_BACKEND_CANISTER_ID], // Replace with your canister ID
          host: "http://127.0.0.1:4943",
        });

        if (!success) {
          alert("Failed to connect Plug Wallet.");
          setLoading(false);
          return;
        }
      }

      // ✅ Step 3: Fetch the Principal ID after successful connection
      const principalId = (await window.ic.plug.agent.getPrincipal()).toString();
      console.log("User Principal:", Principal.fromText(principalId));
      setPrincipal(principalId);

      // ✅ Step 4: Set up agent and create backend actor
      const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
      await agent.fetchRootKey(); // Required for local development

      const auth_did_backend = Actor.createActor(idlFactory, {
        agent,
        canisterId:process.env.REACT_APP_AUTH_DID_BACKEND_CANISTER_ID, // Replace with your canister ID
      });
console.log(form.name,
    form.email,
    form.gender,
    form.mobile,
    form.birthday,
    form.address)
    //   ✅ Step 5: Register the user
      const registerResult = await auth_did_backend.register(
        Principal.fromText(principalId),
        form.name,
        form.email,
        form.gender,
        form.mobile,
        form.birthday,
        form.address
      );

      if ("err" in registerResult) {
        alert(`Registration failed: ${registerResult.err}`);
        setLoading(false);
        return;
      }

      // ✅ Step 6: Mint the NFT (Decentralized Identity)
      const mintResult = await auth_did_backend.mint(Principal.fromText(principalId),"Decentralized Identity", "https://example.com/nft-image.png");

      if ("err" in mintResult) {
        alert(`NFT Minting failed: ${mintResult.err}`);
        setLoading(false);
        return;
      }

      const tokenId = mintResult.ok;
      alert(`NFT Minted Successfully! Token ID: ${tokenId}`);

      // ✅ Step 8: Redirect to Dashboard
      const { name, description, image, email, gender, mobile, dob, address } = form;

      navigate("/dashboard", {
        state: {
          principal: principalId,
          tokenId,
          user: { name, email, mobile, address, gender, dob },
        },
      });

    } catch (error) {
      console.error("Registration failed:", error);
      alert(`Registration failed: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Register</h1>
      <p><strong>Your Principal ID:</strong> {principal || "Not connected"}</p>
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="text" name="mobile" placeholder="Mobile" onChange={handleChange} required />
      <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
      <select name="gender" onChange={handleChange} required>
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <input type="date" name="birthday" onChange={handleChange} required />
      <button onClick={registerUser} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
};

export default Register;

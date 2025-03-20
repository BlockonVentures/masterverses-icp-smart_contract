import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "../declarations/auth-did-backend";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginWithPlug = async () => {
    setLoading(true);
  
    try {
      // ✅ Step 1: Connect to Plug Wallet
      const connected = await window.ic.plug.requestConnect({
        whitelist: [process.env.REACT_APP_AUTH_DID_BACKEND_CANISTER_ID],
        host: "http://127.0.0.1:4943",
      });
  
      if (!connected) {
        alert("Plug connection failed.");
        setLoading(false);
        return;
      }
  
      // ✅ Step 2: Get Principal ID
      const principalId = (await window.ic.plug.agent.getPrincipal()).toString();
      console.log("User Principal:", principalId);
  
      // ✅ Step 3: Initialize Backend Actor
      const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });
      await agent.fetchRootKey();
  
      const auth_did_backend = Actor.createActor(idlFactory, {
        agent,
        canisterId:process.env.REACT_APP_AUTH_DID_BACKEND_CANISTER_ID,
      });
  
      // ✅ Step 4: Check if user owns any NFTs
      const balance = await auth_did_backend.balanceOf(Principal.fromText(principalId));
      if (balance === 0) {
        alert("No NFT found. Redirecting to registration...");
        navigate("/register", { state: { principal: principalId } });
        return;
      }
  
      const tokenIds = await auth_did_backend.tokensOfOwner(Principal.fromText(principalId));
      if (!tokenIds || tokenIds.length === 0) {
        alert("No NFT found. Redirecting to registration...");
        navigate("/register", { state: { principal: principalId } });
        return;
      }
  
      const tokenId = tokenIds[0]; // Assuming the user owns at least one NFT
  
      // ✅ Step 6: Fetch Metadata for the NFT
      const metadataOpt = await auth_did_backend.getMetadata(tokenId);
      if (!metadataOpt || metadataOpt.length === 0) {
        alert("No metadata found for the NFT.");
        setLoading(false);
        return;
      }
  
      const metadata = metadataOpt[0]; // Extract the first element from Optional
      const { name, description, image, email, gender, mobile, dob, address } = metadata;

      navigate("/dashboard", {
        state: {
          principal: principalId,
          tokenId,
          user: { name, email, mobile, address, gender, dob },
        },
      });
    } catch (error) {
      console.error("Plug login failed:", error);
      alert("Plug login failed. Please try again.");
    }
  
    setLoading(false);
  };
  

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Login with Plug Wallet</h1>
      <button onClick={loginWithPlug} disabled={loading}>
        {loading ? "Connecting..." : "Login with Plug"}
      </button>
    </div>
  );
};

export default Login;
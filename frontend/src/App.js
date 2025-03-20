import React, { useState, useEffect } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal"; // Import Principal class
import {idlFactory } from "./declarations/auth-did-backend"
const App = () => {
  const [principal, setPrincipal] = useState(null);
  const [did, setDID] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine if the app is running in a local development environment
  const isLocalEnv = process.env.NODE_ENV !== "production";

  // Create a separate agent for local development
  const localAgent = isLocalEnv ? new HttpAgent({ host: "http://127.0.0.1:4943" }) : null;

  useEffect(() => {
    checkPlugConnection();
  }, []);

  const checkPlugConnection = async () => {
    if (window.ic && window.ic.plug) {
      const connected = await window.ic.plug.isConnected();
      if (connected) {
        console.log("Plug Wallet is connected.");
        await handleAuthenticated();
      } else {
        console.log("Plug Wallet is not connected.");
      }
    }
  };

  const loginWithPlug = async () => {
    setLoading(true);

    try {
      const connected = await window.ic.plug.requestConnect({
        whitelist: ["bkyz2-fmaaa-aaaaa-qaaaq-cai"], // Replace with actual Canister ID
        host: isLocalEnv ? "http://127.0.0.1:4943" : "https://ic0.app", // Use local or mainnet host
      });

      if (connected) {
        await handleAuthenticated();
      } else {
        alert("Plug connection failed.");
      }
    } catch (error) {
      console.error("Plug login failed:", error);
      alert("Plug login failed. Please try again.");
    }

    setLoading(false);
  };

  const handleAuthenticated = async () => {
    try {
      // Get Principal from Plug
      const principalId = await window.ic.plug.agent.getPrincipal();
      setPrincipal(principalId.toString());

      // Fetch the root key for local development
      if (isLocalEnv && localAgent) {
        await localAgent.fetchRootKey(); // Fetch root key for local replica
      }

      // Use the agent from Plug Wallet for production, or localAgent for local development
      const auth_did_backend = Actor.createActor(idlFactory, {
        agent: isLocalEnv ? localAgent : window.ic.plug.agent,
        canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      });

      console.log("Using host:", isLocalEnv ? "http://127.0.0.1:4943" : "https://ic0.app");
      console.log("Using canister ID:", "bkyz2-fmaaa-aaaaa-qaaaq-cai");

      const fetchedDID = await auth_did_backend.getDID(principalId);
      setDID(fetchedDID || "No DID found");
    } catch (error) {
      console.error("Authentication Error:", error);
      alert("Authentication failed. Please try again.");
    }
  };

  const registerDID = async () => {
    if (!principal) return alert("Please log in first.");

    setLoading(true);
    const newDID = `did-${principal.substring(0, 5)}`; // Generate a DID

    try {
      // Fetch the root key for local development
      if (isLocalEnv && localAgent) {
        await localAgent.fetchRootKey(); // Fetch root key for local replica
      }

      // Use the agent from Plug Wallet for production, or localAgent for local development
      const auth_did_backend = Actor.createActor(idlFactory, {
        agent: isLocalEnv ? localAgent : window.ic.plug.agent,
        canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
      });

      // Convert the principal string to a Principal object
      const principalObj = Principal.fromText(principal);

      // Pass the Principal object to the registerUser method
      await auth_did_backend.registerUser(principalObj, newDID);
      setDID(newDID);
    } catch (error) {
      console.error("DID Registration Failed:", error);
      alert("Failed to register DID.");
    }

    setLoading(false);
  };

  const logout = async () => {
    setPrincipal(null);
    setDID("");
    alert("To fully disconnect, go to Plug Wallet and disconnect manually.");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>ICP Authentication with Plug</h1>
      {principal ? (
        <>
          <p>Logged in as: {principal}</p>
          <p>DID: {did}</p>
          <button onClick={registerDID} disabled={loading}>
            {loading ? "Registering..." : "Register DID"}
          </button>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={loginWithPlug} disabled={loading}>
          {loading ? "Connecting..." : "Login with Plug Wallet"}
        </button>
      )}
    </div>
  );
};

export default App;
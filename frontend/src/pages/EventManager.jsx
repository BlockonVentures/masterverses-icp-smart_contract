import React, { useState, useEffect } from "react";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../declarations/auth-did-backend";
import { Principal } from "@dfinity/principal";

const EventManager = () => {
  const [principal, setPrincipal] = useState("");
  const [events, setEvents] = useState([]);
  const [eventData, setEventData] = useState({ title: "", description: "", date: "" });

  const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });

  (async () => {
    await agent.fetchRootKey(); // ✅ Required for local development
  })();
  
  const backend = Actor.createActor(idlFactory, {
    agent,
    canisterId: process.env.REACT_APP_AUTH_DID_BACKEND_CANISTER_ID, // Use your canister ID
  });
  

  useEffect(() => {
    getPrincipal();
    fetchEvents();
  }, []);

  // ✅ Fetch User's Principal ID
  const getPrincipal = async () => {
    if (!window.ic || !window.ic.plug) {
      alert("Plug Wallet not found. Please install it.");
      return;
    }

    const connected = await window.ic.plug.isConnected();
    if (!connected) {
      const success = await window.ic.plug.requestConnect({
        whitelist: [process.env.REACT_APP_AUTH_DID_BACKEND_CANISTER_ID],
        host: "http://127.0.0.1:4943",
      });
      if (!success) {
        alert("Failed to connect Plug Wallet.");
        return;
      }
    }

    const principalId = (await window.ic.plug.agent.getPrincipal()).toString();
    console.log("User Principal:", principalId);
    setPrincipal(principalId);
  };

  // ✅ Create Event
  const createEvent = async () => {
    if (!principal) {
      alert("User not connected.");
      return;
    }

    try {
      const result = await backend.createEvent(
        Principal.fromText(principal),
        eventData.title,
        eventData.description,
        eventData.date
      );

      if ("err" in result) {
        alert(`Failed to create event: ${result.err}`);
      } else {
        alert(`Event Created! Event ID: ${result.ok}`);
        fetchEvents(); // Refresh event list
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Event creation failed.");
    }
  };

//   ✅ Fetch All Events
  const fetchEvents = async () => {
    try {
      const eventsList = await backend.getAllEvents();
      setEvents(eventsList);
      console.log(eventsList)
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Event Manager</h1>
      <h3>Your Principal ID: {principal || "Not connected"}</h3>

      <input type="text" placeholder="Title" onChange={(e) => setEventData({ ...eventData, title: e.target.value })} />
      <input type="text" placeholder="Description" onChange={(e) => setEventData({ ...eventData, description: e.target.value })} />
      <input type="date" onChange={(e) => setEventData({ ...eventData, date: e.target.value })} />
      <button onClick={createEvent}>Create Event</button>

      <h2>All Events</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            <strong>{event.title}</strong> - {event.description} ({event.date})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventManager;

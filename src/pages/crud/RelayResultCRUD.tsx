import React, { useState, useEffect, useMemo } from "react";
import { useRelayResultContext } from "../../contexts/RelayResultContext";
import { RelayResult, Meet, Event, Athlete, Person } from "../../models/index";
import "../../styles/crud-page.css";

const RelayResultCRUD: React.FC = () => {
  const {
    relayResults,
    loading,
    error,
    createRelayResult,
    updateRelayResult,
    deleteRelayResult,
    meets,
    events,
    athletes,
    persons, // Add persons to the context
  } = useRelayResultContext();
  const [selectedRelayResult, setSelectedRelayResult] = useState<RelayResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof RelayResult | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");

  // Use a memoized personMap
  const personMap = useMemo(() => {
    const map: Record<string, Person> = {};
    persons.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [persons]);

  // --- Sorting ---
  const requestSort = (key: keyof RelayResult) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedRelayResults = [...relayResults];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedRelayResults.sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }

  // --- Filtering ---
  const filteredRelayResults = sortedRelayResults.filter((relayResult) => {
    return Object.values(relayResult).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (relayResult: RelayResult | null = null) => {
    setSelectedRelayResult(relayResult);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRelayResult(null);
    setIsModalOpen(false);
  };

  // Helper functions to get names from IDs
  const getMeetName = (meetId: string | undefined) => {
    if (!meetId) return "None";
    const meet = meets.find((m) => m.id === meetId);
    return meet ? meet.nameLong : "Unknown Meet";
  };

  const getEventName = (eventId: string | undefined) => {
    if (!eventId) return "None";
    const event = events.find((e) => e.id === eventId);
    return event ? event.nameShort : "Unknown Event";
  };

  const getAthleteName = (athleteId: string | undefined) => {
    if (!athleteId) return "None";
    const athlete = athletes.find((a) => a.id === athleteId);
    const person = athlete ? personMap[athlete.person] : null; // Access the person from the map
    return athlete && person
      ? `${person.firstName} ${person.lastName} (Grade ${athlete.grade})`
      : "Unknown Athlete";
  };

  const handleCreateRelayResult = async (
    data: Omit<RelayResult, "id" | "team" | "season"> & { athletes: string[] }
  ) => {
    try {
      // Determine team and season from the first athlete
      const firstAthleteId = data.athletes[0];
      const firstAthlete = athletes.find((a) => a.id === firstAthleteId);
      const meet = meets.find((m) => m.id === data.meet);

      if (!firstAthlete || !meet) {
        console.error("Could not determine team or season.");
        return;
      }

      const relayData: Omit<RelayResult, "id"> = {
        meet: data.meet,
        event: data.event,
        athletes: data.athletes,
        result: data.result,
        dq: data.dq,
        team: firstAthlete.team,
        season: meet.season,
      };
      await createRelayResult(relayData);
      setIsModalOpen(false); // optionally close modal
    } catch (err) {
      console.error("Error creating relay result:", err);
    }
  };

  const handleUpdateRelayResult = async (
    data: Omit<RelayResult, "team" | "season"> & { id: string; athletes: string[] }
  ) => {
    try {
      const firstAthleteId = data.athletes[0];
      const firstAthlete = athletes.find((a) => a.id === firstAthleteId);
      const meet = meets.find((m) => m.id === data.meet);

      if (!firstAthlete || !meet) {
        console.error("Could not determine team or season for update.");
        return;
      }

      const relayData: Omit<RelayResult, "id"> = {
        meet: data.meet,
        event: data.event,
        athletes: data.athletes,
        result: data.result,
        dq: data.dq,
        team: firstAthlete.team,
        season: meet.season,
      };
      await updateRelayResult({ ...relayData, id: data.id }); // Include the ID for update
      setIsModalOpen(false); // optionally close modal
    } catch (err) {
      console.error("Error updating relay result:", err);
    }
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">Relay Results</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Result
        </button>
        <input
          type="text"
          className="crud-filter"
          placeholder="Filter..."
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <div className="crud-table-container">
          <table className="crud-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("meet")}>
                  Meet{" "}
                  {sortConfig.key === "meet" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("event")}>
                  Event{" "}
                  {sortConfig.key === "event" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Athletes</th>
                <th onClick={() => requestSort("result")}>
                  Result{" "}
                  {sortConfig.key === "result" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("dq")}>
                  DQ {sortConfig.key === "dq" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRelayResults.map((result) => (
                <tr key={result.id}>
                  <td className="table-cell-meet">{getMeetName(result.meet)}</td>
                  <td className="table-cell-event">{getEventName(result.event)}</td>
                  <td className="table-cell-athletes">
                    {result.athletes.map((athleteId) => getAthleteName(athleteId)).join(", ")}
                  </td>
                  <td className="table-cell-result">{result.result}</td>
                  <td className="table-cell-dq">{result.dq ? "Yes" : "No"}</td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(result)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteRelayResult(result.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <RelayResultModal
          relayResult={selectedRelayResult}
          onClose={closeModal}
          onCreate={handleCreateRelayResult}
          onUpdate={handleUpdateRelayResult}
          meets={meets}
          events={events}
          athletes={athletes}
          personMap={personMap} // Pass the personMap to the modal
        />
      )}
    </div>
  );
};

// --- RelayResult Modal Component ---
const RelayResultModal: React.FC<{
  relayResult: RelayResult | null;
  onClose: () => void;
  onCreate: (
    relayResult: Omit<RelayResult, "id" | "team" | "season"> & { athletes: string[] }
  ) => void;
  onUpdate: (
    relayResult: Omit<RelayResult, "team" | "season"> & { id: string; athletes: string[] }
  ) => void;
  meets: Meet[];
  events: Event[];
  athletes: Athlete[];
  personMap: Record<string, Person>; // Pass the personMap as a prop
}> = ({ relayResult, onClose, onCreate, onUpdate, meets, events, athletes, personMap }) => {
  const [meet, setMeet] = useState(relayResult?.meet || "");
  const [event, setEvent] = useState(relayResult?.event || "");
  const [athlete1, setAthlete1] = useState(relayResult?.athletes?.[0] || "");
  const [athlete2, setAthlete2] = useState(relayResult?.athletes?.[1] || "");
  const [athlete3, setAthlete3] = useState(relayResult?.athletes?.[2] || "");
  const [athlete4, setAthlete4] = useState(relayResult?.athletes?.[3] || "");
  const [result, setResult] = useState(relayResult?.result || 0);
  const [dq, setDq] = useState(relayResult?.dq || false);

  // State to hold events filtered by the selected meet
  const [meetEvents, setMeetEvents] = useState<Event[]>([]);

  // Update meetEvents when the selected meet changes
  useEffect(() => {
    if (meet) {
      // Filter events based on the selected meet's eventOrder
      const selectedMeet = meets.find((m) => m.id === meet);
      if (selectedMeet && selectedMeet.eventOrder) {
        const filteredEvents = events.filter((e) => selectedMeet.eventOrder!.includes(e.id));
        setMeetEvents(filteredEvents);
      } else {
        setMeetEvents([]); // No events if no meet is selected
      }
    } else {
      setMeetEvents([]);
    }
  }, [meet, meets, events]);

  const getAthleteName = (athleteId: string | undefined) => {
    if (!athleteId) return "None";
    const athleteData = athletes.find((a) => a.id === athleteId);
    return athleteData ? `${athleteData.person} (Grade ${athleteData.grade})` : "Unknown Athlete";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      meet,
      event,
      athletes: [athlete1, athlete2, athlete3, athlete4].filter(Boolean) as string[],
      result: Number(result),
      dq,
    };

    if (relayResult) {
      await onUpdate({ ...formData, id: relayResult.id });
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{relayResult ? "Edit Relay Result" : "Add Relay Result"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="meet">Meet</label>
            <select id="meet" value={meet} onChange={(e) => setMeet(e.target.value)}>
              <option value="">Select Meet</option>
              {meets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nameLong}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="event">Event</label>
            <select id="event" value={event} onChange={(e) => setEvent(e.target.value)}>
              <option value="">Select Event</option>
              {meetEvents.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nameShort}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="athlete1">Athlete 1</label>
            <select id="athlete1" value={athlete1} onChange={(e) => setAthlete1(e.target.value)}>
              <option value="">Select Athlete</option>
              {athletes.map((a) => {
                const person = personMap[a.person];
                return (
                  <option key={a.id} value={a.id}>
                    {person
                      ? `${person.firstName} ${person.lastName} (Grade ${a.grade})`
                      : "Unknown"}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="athlete2">Athlete 2</label>
            <select id="athlete2" value={athlete2} onChange={(e) => setAthlete2(e.target.value)}>
              <option value="">Select Athlete</option>
              {athletes.map((a) => {
                const person = personMap[a.person];
                return (
                  <option key={a.id} value={a.id}>
                    {person
                      ? `${person.firstName} ${person.lastName} (Grade ${a.grade})`
                      : "Unknown"}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="athlete3">Athlete 3</label>
            <select id="athlete3" value={athlete3} onChange={(e) => setAthlete3(e.target.value)}>
              <option value="">Select Athlete</option>
              {athletes.map((a) => {
                const person = personMap[a.person];
                return (
                  <option key={a.id} value={a.id}>
                    {person
                      ? `${person.firstName} ${person.lastName} (Grade ${a.grade})`
                      : "Unknown"}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="athlete4">Athlete 4</label>
            <select id="athlete4" value={athlete4} onChange={(e) => setAthlete4(e.target.value)}>
              <option value="">Select Athlete</option>
              {athletes.map((a) => {
                const person = personMap[a.person];
                return (
                  <option key={a.id} value={a.id}>
                    {person
                      ? `${person.firstName} ${person.lastName} (Grade ${a.grade})`
                      : "Unknown"}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="result">Result</label>
            <input
              type="number"
              id="result"
              value={result}
              onChange={(e) => setResult(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dq">DQ</label>
            <input type="checkbox" id="dq" checked={dq} onChange={(e) => setDq(e.target.checked)} />
          </div>
          <div className="form-actions">
            <button type="submit" className="crud-button save-button">
              Save
            </button>
            <button type="button" className="crud-button cancel-button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RelayResultCRUD;

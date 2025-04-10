import React, { useState, useEffect, useMemo } from "react";
import { useIndividualResultContext } from "../../contexts/IndividualResultContext";
import { IndividualResult, Meet, Event, Athlete, Person } from "../../models/index";
import "../../styles/crud-page.css";

const IndividualResultCRUD: React.FC = () => {
  const {
    individualResults,
    loading,
    error,
    createIndividualResult,
    updateIndividualResult,
    deleteIndividualResult,
    meets,
    events,
    athletes,
    persons,
  } = useIndividualResultContext();
  const [selectedIndividualResult, setSelectedIndividualResult] = useState<IndividualResult | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IndividualResult | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");

  const personMap = useMemo(() => {
    const map: Record<string, Person> = {};
    persons.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [persons]);

  // --- Sorting ---
  const requestSort = (key: keyof IndividualResult) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedIndividualResults = [...individualResults];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedIndividualResults.sort((a, b) => {
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
  const filteredIndividualResults = sortedIndividualResults.filter((individualResult) => {
    return Object.values(individualResult).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (individualResult: IndividualResult | null = null) => {
    setSelectedIndividualResult(individualResult);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedIndividualResult(null);
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
    const person = athlete ? personMap[athlete.person] : null;
    return athlete && person
      ? `${person.firstName} ${person.lastName} (Grade ${athlete.grade})`
      : "Unknown Athlete";
  };

  const handleCreateIndividualResult = async (
    data: Omit<IndividualResult, "id" | "team" | "season" | "age">
  ) => {
    try {
      await createIndividualResult(data);
      setIsModalOpen(false); // optionally close modal
    } catch (err) {
      console.error("Error creating individual result:", err);
    }
  };

  const handleUpdateIndividualResult = async (
    data: Omit<IndividualResult, "team" | "season" | "age">
  ) => {
    try {
      await updateIndividualResult(data); // Use only the allowed properties
      setIsModalOpen(false); // optionally close modal
    } catch (err) {
      console.error("Error updating individual result:", err);
    }
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">Individual Results</h1>

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
                <th onClick={() => requestSort("athlete")}>
                  Athlete{" "}
                  {sortConfig.key === "athlete" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
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
              {filteredIndividualResults.map((result) => (
                <tr key={result.id}>
                  <td className="table-cell-meet">{getMeetName(result.meet)}</td>
                  <td className="table-cell-event">{getEventName(result.event)}</td>
                  <td className="table-cell-athlete">{getAthleteName(result.athlete)}</td>
                  <td className="table-cell-result">{result.result}</td>
                  <td className="table-cell-dq">{result.dq ? "Yes" : "No"}</td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(result)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteIndividualResult(result.id)}
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
        <IndividualResultModal
          individualResult={selectedIndividualResult}
          onClose={closeModal}
          onCreate={handleCreateIndividualResult}
          onUpdate={handleUpdateIndividualResult}
          meets={meets}
          events={events}
          athletes={athletes}
          personMap={personMap}
        />
      )}
    </div>
  );
};

// --- IndividualResult Modal Component ---
const IndividualResultModal: React.FC<{
  individualResult: IndividualResult | null;
  onClose: () => void;
  onCreate: (individualResult: Omit<IndividualResult, "id" | "team" | "season" | "age">) => void;
  onUpdate: (individualResult: Omit<IndividualResult, "team" | "season" | "age">) => void;
  meets: Meet[];
  events: Event[];
  athletes: Athlete[];
  personMap: Record<string, Person>;
}> = ({ individualResult, onClose, onCreate, onUpdate, meets, events, athletes, personMap }) => {
  const [meet, setMeet] = useState(individualResult?.meet || "");
  const [event, setEvent] = useState(individualResult?.event || "");
  const [athlete, setAthlete] = useState(individualResult?.athlete || "");
  const [result, setResult] = useState(individualResult?.result || 0);
  const [dq, setDq] = useState(individualResult?.dq || false);

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

  // Function to calculate age
  const calculateAge = (athleteId: string, meetId: string): number => {
    const athleteData = athletes.find((a) => a.id === athleteId);
    const meetData = meets.find((m) => m.id === meetId);

    if (!athleteData || !athleteData.person || !athleteData.grade || !meetData || !meetData.date) {
      return 0; // Or some default value or error handling
    }

    // Replace this with your actual age calculation logic
    // This is a placeholder:
    return athleteData.grade;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate team, season, and age here
    const selectedAthlete = athletes.find((a) => a.id === athlete);
    const selectedMeet = meets.find((m) => m.id === meet);

    const team = selectedAthlete ? selectedAthlete.team : ""; // Or handle this as needed
    const season = selectedMeet ? selectedMeet.season : ""; // Or handle this as needed
    const age = calculateAge(athlete, meet);

    const formData: IndividualResult = {
      id: individualResult?.id || String(Date.now()),
      meet,
      event,
      athlete,
      team,
      season,
      age,
      result: Number(result),
      dq,
    };

    // Omit team, season, and age before sending to Firestore
    const formDataForFirestore = {
      ...formData,
      team: undefined,
      season: undefined,
      age: undefined,
    };

    if (individualResult) {
      await onUpdate(formDataForFirestore);
    } else {
      await onCreate(formDataForFirestore);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{individualResult ? "Edit Result" : "Add Result"}</h2>
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
            <label htmlFor="athlete">Athlete</label>
            <select id="athlete" value={athlete} onChange={(e) => setAthlete(e.target.value)}>
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

export default IndividualResultCRUD;

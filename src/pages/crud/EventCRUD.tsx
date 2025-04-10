import React, { useState } from "react";
import { useEventContext } from "../../contexts/EventContext";
import { Event } from "../../models/index";
import "../../styles/crud-page.css";

const EventCRUD: React.FC = () => {
  const { events, loading, error, createEvent, updateEvent, deleteEvent } = useEventContext();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Event | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Sorting ---
  const requestSort = (key: keyof Event) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedEvents = [...events];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedEvents.sort((a, b) => {
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
  const filteredEvents = sortedEvents.filter((event) => {
    return Object.values(event).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (event: Event | null = null) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
  };

  // Handlers to pass to the modal
  const handleCreateEvent = async (newEvent: Event) => {
    await createEvent(newEvent);
    closeModal();
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    await updateEvent(updatedEvent);
    closeModal();
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">Events</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Event
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
                <th onClick={() => requestSort("code")}>
                  Code{" "}
                  {sortConfig.key === "code" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("nameLong")}>
                  Name (Long){" "}
                  {sortConfig.key === "nameLong" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("nameShort")}>
                  Name (Short){" "}
                  {sortConfig.key === "nameShort" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("course")}>
                  Course{" "}
                  {sortConfig.key === "course" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("distance")}>
                  Distance{" "}
                  {sortConfig.key === "distance" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("stroke")}>
                  Stroke{" "}
                  {sortConfig.key === "stroke" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("official")}>
                  Official{" "}
                  {sortConfig.key === "official" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td className="table-cell-code">{event.code}</td>
                  <td className="table-cell-name-long">{event.nameLong}</td>
                  <td className="table-cell-name-short">{event.nameShort}</td>
                  <td className="table-cell-course">{event.course}</td>
                  <td className="table-cell-distance">{event.distance}</td>
                  <td className="table-cell-stroke">{event.stroke}</td>
                  <td className="table-cell-official">{event.official ? "Yes" : "No"}</td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(event)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteEvent(event.id)}
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
        <EventModal
          event={selectedEvent}
          onClose={closeModal}
          onCreate={handleCreateEvent}
          onUpdate={handleUpdateEvent}
        />
      )}
    </div>
  );
};

// --- Event Modal Component ---
const EventModal: React.FC<{
  event: Event | null;
  onClose: () => void;
  onCreate: (event: Event) => void;
  onUpdate: (event: Event) => void;
}> = ({ event, onClose, onCreate, onUpdate }) => {
  const [code, setCode] = useState(event?.code || "");
  const [nameLong, setNameLong] = useState(event?.nameLong || "");
  const [nameShort, setNameShort] = useState(event?.nameShort || "");
  const [course, setCourse] = useState(event?.course || "");
  const [distance, setDistance] = useState(event?.distance || 0);
  const [stroke, setStroke] = useState(event?.stroke || "");
  const [official, setOfficial] = useState(event?.official || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Event = {
      id: event?.id || String(Date.now()),
      code,
      nameLong,
      nameShort,
      course,
      distance: Number(distance),
      stroke,
      official,
    };
    if (event) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{event ? "Edit Event" : "Add Event"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Code</label>
            <input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="nameLong">Name (Long)</label>
            <input
              type="text"
              id="nameLong"
              value={nameLong}
              onChange={(e) => setNameLong(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="nameShort">Name (Short)</label>
            <input
              type="text"
              id="nameShort"
              value={nameShort}
              onChange={(e) => setNameShort(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              id="course"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="distance">Distance</label>
            <input
              type="number"
              id="distance"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="stroke">Stroke</label>
            <input
              type="text"
              id="stroke"
              value={stroke}
              onChange={(e) => setStroke(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="official">Official</label>
            <input
              type="checkbox"
              id="official"
              checked={official}
              onChange={(e) => setOfficial(e.target.checked)}
            />
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

export default EventCRUD;

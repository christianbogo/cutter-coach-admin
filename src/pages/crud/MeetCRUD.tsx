import React, { useState } from "react";
import { useMeetContext } from "../../contexts/MeetContext";
import { Meet, Season, Event } from "../../models/index";
import "../../styles/crud-page.css";

const MeetCRUD: React.FC = () => {
  const { meets, loading, error, createMeet, updateMeet, deleteMeet, seasons, events } =
    useMeetContext();
  const [selectedMeet, setSelectedMeet] = useState<Meet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Meet | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");

  // --- Sorting ---
  const requestSort = (key: keyof Meet) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedMeets = [...meets];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedMeets.sort((a, b) => {
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
  const filteredMeets = sortedMeets.filter((meet) => {
    return Object.values(meet).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (meet: Meet | null = null) => {
    setSelectedMeet(meet);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedMeet(null);
    setIsModalOpen(false);
  };

  // Function to get season name from id
  const getSeasonName = (seasonId: string | undefined) => {
    if (!seasonId) return "None";
    const season = seasons.find((s) => s.id === seasonId);
    return season ? season.nameLong : "Unknown Season";
  };

  async function handleUpdateMeet(meet: Meet): Promise<void> {
    try {
      await updateMeet(meet);
      closeModal();
    } catch (error) {
      console.error("Failed to update meet:", error);
    }
  }

  async function handleCreateMeet(meet: Meet): Promise<void> {
    try {
      await createMeet(meet);
      closeModal();
    } catch (error) {
      console.error("Failed to create meet:", error);
    }
  }
  return (
    <div className="crud-container">
      <h1 className="crud-title">Meets</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Meet
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
                <th onClick={() => requestSort("date")}>
                  Date{" "}
                  {sortConfig.key === "date" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("season")}>
                  Season{" "}
                  {sortConfig.key === "season" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeets.map((meet) => (
                <tr key={meet.id}>
                  <td className="table-cell-name-long">{meet.nameLong}</td>
                  <td className="table-cell-name-short">{meet.nameShort}</td>
                  <td className="table-cell-date">{meet.date}</td>
                  <td className="table-cell-season">{getSeasonName(meet.season)}</td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(meet)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteMeet(meet.id)}
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
        <MeetModal
          meet={selectedMeet}
          onClose={closeModal}
          onCreate={handleCreateMeet}
          onUpdate={handleUpdateMeet}
          seasons={seasons}
          events={events}
        />
      )}
    </div>
  );
};

// --- Meet Modal Component ---
const MeetModal: React.FC<{
  meet: Meet | null;
  onClose: () => void;
  onCreate: (meet: Meet) => void;
  onUpdate: (meet: Meet) => void;
  seasons: Season[];
  events: Event[];
}> = ({ meet, onClose, onCreate, onUpdate, seasons, events }) => {
  const [nameLong, setNameLong] = useState(meet?.nameLong || "");
  const [nameShort, setNameShort] = useState(meet?.nameShort || "");
  const [date, setDate] = useState(meet?.date || "");
  const [season, setSeason] = useState(meet?.season || "");
  const [eventOrder, setEventOrder] = useState<string[]>(meet?.eventOrder || []);
  const [selectedEventId, setSelectedEventId] = useState("");

  // Function to add an event to the order
  const addEventToOrder = () => {
    if (selectedEventId) {
      setEventOrder([...eventOrder, selectedEventId]);
      setSelectedEventId(""); // Reset dropdown
    }
  };

  // Function to remove an event from the order
  const removeEventFromOrder = (index: number) => {
    const newEventOrder = [...eventOrder];
    newEventOrder.splice(index, 1);
    setEventOrder(newEventOrder);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Meet = {
      id: meet?.id || String(Date.now()),
      nameLong,
      nameShort,
      date,
      season,
      eventOrder,
      isComplete: meet?.isComplete || false,
    };
    if (meet) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{meet ? "Edit Meet" : "Add Meet"}</h2>
        <form onSubmit={handleSubmit}>
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
            <label htmlFor="date">Date</label>
            <input type="text" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="season">Season</label>
            <select id="season" value={season} onChange={(e) => setSeason(e.target.value)}>
              <option value="">None</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameLong}
                </option>
              ))}
            </select>
          </div>

          {/* Event Order Section */}
          <div className="form-group">
            <label>Event Order</label>
            <div className="event-order-container">
              <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
                <option value="">Select Event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nameShort}
                  </option>
                ))}
              </select>
              <button type="button" onClick={addEventToOrder}>
                Add
              </button>
            </div>
            <ol>
              {eventOrder.map((eventId, index) => {
                const event = events.find((e) => e.id === eventId);
                return (
                  <li key={index}>
                    {event ? event.nameShort : "Unknown Event"}{" "}
                    <button type="button" onClick={() => removeEventFromOrder(index)}>
                      Remove
                    </button>
                  </li>
                );
              })}
            </ol>
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

export default MeetCRUD;

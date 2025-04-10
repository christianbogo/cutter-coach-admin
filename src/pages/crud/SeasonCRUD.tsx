import React, { useState } from "react";
import { useSeasonContext } from "../../contexts/SeasonContext";
import { Season, Team } from "../../models/index";
import "../../styles/crud-page.css";

const SeasonCRUD: React.FC = () => {
  const { seasons, loading, error, createSeason, updateSeason, deleteSeason, teams } =
    useSeasonContext(); // Consume teams from context
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Season | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Sorting ---
  const requestSort = (key: keyof Season) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedSeasons = [...seasons];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedSeasons.sort((a, b) => {
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
  const filteredSeasons = sortedSeasons.filter((season) => {
    return Object.values(season).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (season: Season | null = null) => {
    setSelectedSeason(season);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSeason(null);
    setIsModalOpen(false);
  };

  // Handlers to pass to the modal
  const handleCreateSeason = async (newSeason: Season) => {
    await createSeason(newSeason);
    closeModal();
  };

  const handleUpdateSeason = async (updatedSeason: Season) => {
    await updateSeason(updatedSeason);
    closeModal();
  };

  // Function to get team name from id
  const getTeamName = (teamId: string | undefined) => {
    if (!teamId) return "None";
    const team = teams.find((t) => t.id === teamId);
    return team ? team.nameLong : "Unknown Team";
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">Seasons</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Season
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
                <th onClick={() => requestSort("startDate")}>
                  Start Date{" "}
                  {sortConfig.key === "startDate" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("endDate")}>
                  End Date{" "}
                  {sortConfig.key === "endDate" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("team")}>
                  Team{" "}
                  {sortConfig.key === "team" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeasons.map((season) => (
                <tr key={season.id}>
                  <td className="table-cell-name-long">{season.nameLong}</td>
                  <td className="table-cell-name-short">{season.nameShort}</td>
                  <td className="table-cell-start-date">{season.startDate}</td>
                  <td className="table-cell-end-date">{season.endDate}</td>
                  <td className="table-cell-team">{getTeamName(season.team)}</td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(season)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteSeason(season.id)}
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
        <SeasonModal
          season={selectedSeason}
          onClose={closeModal}
          onCreate={handleCreateSeason}
          onUpdate={handleUpdateSeason}
          teams={teams} // Pass teams to the modal
        />
      )}
    </div>
  );
};

// --- Season Modal Component ---
const SeasonModal: React.FC<{
  season: Season | null;
  onClose: () => void;
  onCreate: (season: Season) => void;
  onUpdate: (season: Season) => void;
  teams: Team[]; // Receive teams as prop
}> = ({ season, onClose, onCreate, onUpdate, teams }) => {
  const [team, setTeam] = useState(season?.team || "");
  const [nameLong, setNameLong] = useState(season?.nameLong || "");
  const [nameShort, setNameShort] = useState(season?.nameShort || "");
  const [startDate, setStartDate] = useState(season?.startDate || "");
  const [endDate, setEndDate] = useState(season?.endDate || "");
  const [isComplete, setIsComplete] = useState(season?.isComplete || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Season = {
      id: season?.id || String(Date.now()),
      team,
      nameLong,
      nameShort,
      startDate,
      endDate,
      isComplete,
    };
    if (season) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{season ? "Edit Season" : "Add Season"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="team">Team</label>
            <select id="team" value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="">None</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.nameLong}
                </option>
              ))}
            </select>
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
            <label htmlFor="startDate">Start Date</label>
            <input
              type="text"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="text"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="isComplete">Complete</label>
            <input
              type="checkbox"
              id="isComplete"
              checked={isComplete}
              onChange={(e) => setIsComplete(e.target.checked)}
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

export default SeasonCRUD;

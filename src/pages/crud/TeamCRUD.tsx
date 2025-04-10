import React, { useState } from "react";
import { useTeamContext } from "../../contexts/TeamContext";
import { Team, Season } from "../../models/index";
import "../../styles/crud-page.css";

const TeamCRUD: React.FC = () => {
  const { teams, loading, error, createTeam, updateTeam, deleteTeam, seasons } = useTeamContext(); // Consume seasons from context
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Team | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");

  // --- Sorting ---
  const requestSort = (key: keyof Team) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedTeams = [...teams];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedTeams.sort((a, b) => {
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
  const filteredTeams = sortedTeams.filter((team) => {
    return Object.values(team).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (team: Team | null = null) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setIsModalOpen(false);
  };

  // Handlers to pass to the modal
  const handleCreateTeam = async (newTeam: Team) => {
    await createTeam(newTeam);
    closeModal();
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    await updateTeam(updatedTeam);
    closeModal();
  };

  // Function to get season name from id
  const getSeasonName = (seasonId: string | undefined) => {
    if (!seasonId) return "None";
    const season = seasons.find((s) => s.id === seasonId);
    return season ? season.nameLong : "Unknown Season";
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">Teams</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Team
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
                <th onClick={() => requestSort("type")}>
                  Type{" "}
                  {sortConfig.key === "type" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
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
                <th onClick={() => requestSort("currentSeason")}>
                  Current Season{" "}
                  {sortConfig.key === "currentSeason" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id}>
                  <td className="table-cell-code">{team.code}</td>
                  <td className="table-cell-type">{team.type}</td>
                  <td className="table-cell-name-long">{team.nameLong}</td>
                  <td className="table-cell-name-short">{team.nameShort}</td>
                  <td className="table-cell-current-season">{getSeasonName(team.currentSeason)}</td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(team)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteTeam(team.id)}
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
        <TeamModal
          team={selectedTeam}
          onClose={closeModal}
          onCreate={handleCreateTeam}
          onUpdate={handleUpdateTeam}
          seasons={seasons} // Pass seasons to the modal
        />
      )}
    </div>
  );
};

// --- Team Modal Component ---
const TeamModal: React.FC<{
  team: Team | null;
  onClose: () => void;
  onCreate: (team: Team) => void;
  onUpdate: (team: Team) => void;
  seasons: Season[]; // Receive seasons as prop
}> = ({ team, onClose, onCreate, onUpdate, seasons }) => {
  const [code, setCode] = useState(team?.code || "");
  const [type, setType] = useState(team?.type || "");
  const [nameLong, setNameLong] = useState(team?.nameLong || "");
  const [nameShort, setNameShort] = useState(team?.nameShort || "");
  const [currentSeason, setCurrentSeason] = useState(team?.currentSeason || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Team = {
      id: team?.id || String(Date.now()),
      code,
      type,
      nameLong,
      nameShort,
      currentSeason,
    };
    if (team) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{team ? "Edit Team" : "Add Team"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Code</label>
            <input type="text" id="code" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type</label>
            <input type="text" id="type" value={type} onChange={(e) => setType(e.target.value)} />
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
            <label htmlFor="currentSeason">Current Season</label>
            <select
              id="currentSeason"
              value={currentSeason}
              onChange={(e) => setCurrentSeason(e.target.value)}
            >
              <option value="">None</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.nameLong}
                </option>
              ))}
            </select>
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

export default TeamCRUD;

import React, { useState } from "react";
import { useAthleteContext } from "../../contexts/AthleteContext";
import { Athlete, Team, Season, Person } from "../../models/index";
import "../../styles/crud-page.css";

const AthleteCRUD: React.FC = () => {
  const {
    athletes,
    loading,
    error,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    people,
    seasons,
    teams,
  } = useAthleteContext();
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Athlete | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Sorting ---
  const requestSort = (key: keyof Athlete) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedAthletes = [...athletes];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedAthletes.sort((a, b) => {
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
  const filteredAthletes = sortedAthletes.filter((athlete) => {
    return Object.values(athlete).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (athlete: Athlete | null = null) => {
    setSelectedAthlete(athlete);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAthlete(null);
    setIsModalOpen(false);
  };

  // Handlers to pass to the modal
  const handleCreateAthlete = async (newAthlete: Athlete) => {
    await createAthlete(newAthlete);
    closeModal();
  };

  const handleUpdateAthlete = async (updatedAthlete: Athlete) => {
    await updateAthlete(updatedAthlete);
    closeModal();
  };

  // Helper functions to get names from IDs
  const getPersonName = (personId: string | undefined) => {
    if (!personId) return "None";
    const person = people.find((p) => p.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : "Unknown Person";
  };

  const getSeasonName = (seasonId: string | undefined) => {
    if (!seasonId) return "None";
    const season = seasons.find((s) => s.id === seasonId);
    return season ? season.nameLong : "Unknown Season";
  };

  const getTeamName = (teamId: string | undefined) => {
    if (!teamId) return "None";
    const team = teams.find((t) => t.id === teamId);
    return team ? team.nameLong : "Unknown Team";
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">Athletes</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Athlete
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
                <th onClick={() => requestSort("person")}>
                  Person{" "}
                  {sortConfig.key === "person" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("season")}>
                  Season{" "}
                  {sortConfig.key === "season" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("team")}>
                  Team{" "}
                  {sortConfig.key === "team" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("grade")}>
                  Grade{" "}
                  {sortConfig.key === "grade" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("group")}>
                  Group{" "}
                  {sortConfig.key === "group" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("subgroup")}>
                  Subgroup{" "}
                  {sortConfig.key === "subgroup" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("lane")}>
                  Lane{" "}
                  {sortConfig.key === "lane" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("hasDisability")}>
                  Disability{" "}
                  {sortConfig.key === "hasDisability" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.map((athlete) => (
                <tr key={athlete.id}>
                  <td className="table-cell-person">{getPersonName(athlete.person)}</td>
                  <td className="table-cell-season">{getSeasonName(athlete.season)}</td>
                  <td className="table-cell-team">{getTeamName(athlete.team)}</td>
                  <td className="table-cell-grade">{athlete.grade}</td>
                  <td className="table-cell-group">{athlete.group}</td>
                  <td className="table-cell-subgroup">{athlete.subgroup}</td>
                  <td className="table-cell-lane">{athlete.lane}</td>
                  <td className="table-cell-hasDisability">
                    {athlete.hasDisability ? "Yes" : "No"}
                  </td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(athlete)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteAthlete(athlete.id)}
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
        <AthleteModal
          athlete={selectedAthlete}
          onClose={closeModal}
          onCreate={handleCreateAthlete}
          onUpdate={handleUpdateAthlete}
          people={people}
          seasons={seasons}
          teams={teams}
        />
      )}
    </div>
  );
};

// --- Athlete Modal Component ---
const AthleteModal: React.FC<{
  athlete: Athlete | null;
  onClose: () => void;
  onCreate: (athlete: Athlete) => void;
  onUpdate: (athlete: Athlete) => void;
  people: Person[];
  seasons: Season[];
  teams: Team[];
}> = ({ athlete, onClose, onCreate, onUpdate, people, seasons, teams }) => {
  const [person, setPerson] = useState(athlete?.person || "");
  const [season, setSeason] = useState(athlete?.season || "");
  const [team, setTeam] = useState(athlete?.team || "");
  const [grade, setGrade] = useState(athlete?.grade || 9);
  const [group, setGroup] = useState(athlete?.group || "");
  const [subgroup, setSubgroup] = useState(athlete?.subgroup || "");
  const [lane, setLane] = useState(athlete?.lane || 1);
  const [hasDisability, setHasDisability] = useState(athlete?.hasDisability || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Athlete = {
      id: athlete?.id || String(Date.now()),
      person,
      season,
      team,
      grade: Number(grade),
      group,
      subgroup,
      lane: Number(lane),
      hasDisability,
    };
    if (athlete) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{athlete ? "Edit Athlete" : "Add Athlete"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="person">Person</label>
            <select id="person" value={person} onChange={(e) => setPerson(e.target.value)}>
              <option value="">None</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
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
          <div className="form-group">
            <label htmlFor="team">Team</label>
            <select id="team" value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="">None</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nameLong}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="grade">Grade</label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="group">Group</label>
            <input
              type="text"
              id="group"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="subgroup">Subgroup</label>
            <input
              type="text"
              id="subgroup"
              value={subgroup}
              onChange={(e) => setSubgroup(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lane">Lane</label>
            <input
              type="number"
              id="lane"
              value={lane}
              onChange={(e) => setLane(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="hasDisability">Has Disability</label>
            <input
              type="checkbox"
              id="hasDisability"
              checked={hasDisability}
              onChange={(e) => setHasDisability(e.target.checked)}
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

export default AthleteCRUD;

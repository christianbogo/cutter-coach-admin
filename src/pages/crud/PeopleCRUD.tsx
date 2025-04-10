import React, { useState } from "react";
import { usePeopleContext } from "../../contexts/PeopleContext";
import { Person } from "../../models/index";
import "../../styles/crud-page.css";

const PeopleCRUD: React.FC = () => {
  const { people, loading, error, createPerson, updatePerson, deletePerson } = usePeopleContext();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Person | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");

  // --- Sorting ---
  const requestSort = (key: keyof Person) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedPeople = [...people];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedPeople.sort((a, b) => {
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
  const filteredPeople = sortedPeople.filter((person) => {
    return Object.values(person).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (person: Person | null = null) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPerson(null);
    setIsModalOpen(false);
  };

  // Handlers to pass to the modal
  const handleCreatePerson = async (newPerson: Person) => {
    await createPerson(newPerson);
    closeModal();
  };

  const handleUpdatePerson = async (updatedPerson: Person) => {
    await updatePerson(updatedPerson);
    closeModal();
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">People</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Person
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
                <th onClick={() => requestSort("firstName")}>
                  First{" "}
                  {sortConfig.key === "firstName" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("preferredName")}>
                  Pref{" "}
                  {sortConfig.key === "preferredName" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("lastName")}>
                  Last{" "}
                  {sortConfig.key === "lastName" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("birthday")}>
                  Bday{" "}
                  {sortConfig.key === "birthday" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("gender")}>
                  G{" "}
                  {sortConfig.key === "gender" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("phone")}>
                  Phone{" "}
                  {sortConfig.key === "phone" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("email")}>
                  Email{" "}
                  {sortConfig.key === "email" && (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPeople.map((person) => (
                <tr key={person.id}>
                  <td className="table-cell-first-name">{person.firstName}</td>
                  <td className="table-cell-preferred-name">{person.preferredName}</td>
                  <td className="table-cell-last-name">{person.lastName}</td>
                  <td className="table-cell-birthday">{person.birthday}</td>
                  <td className="table-cell-gender">{person.gender}</td>
                  <td className="table-cell-phone">{person.phone}</td>
                  <td className="table-cell-email">{person.email}</td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(person)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deletePerson(person.id)}
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
        <PersonModal
          person={selectedPerson}
          onClose={closeModal}
          onCreate={handleCreatePerson}
          onUpdate={handleUpdatePerson}
        />
      )}
    </div>
  );
};

// --- Person Modal Component ---
const PersonModal: React.FC<{
  person: Person | null;
  onClose: () => void;
  onCreate: (person: Person) => void;
  onUpdate: (person: Person) => void;
}> = ({ person, onClose, onCreate, onUpdate }) => {
  const [firstName, setFirstName] = useState(person?.firstName || "");
  const [preferredName, setPreferredName] = useState(person?.preferredName || "");
  const [lastName, setLastName] = useState(person?.lastName || "");
  const [birthday, setBirthday] = useState(person?.birthday || "");
  const [gender, setGender] = useState(person?.gender || "M");
  const [phone, setPhone] = useState(person?.phone || ""); // Add phone
  const [email, setEmail] = useState(person?.email || ""); // Add email
  const [isArchived, setIsArchived] = useState(person?.isArchived || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Person = {
      id: person?.id || String(Date.now()),
      firstName,
      preferredName,
      lastName,
      birthday,
      gender,
      phone, // Add phone
      email, // Add email
      isArchived,
    };
    if (person) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{person ? "Edit Person" : "Add Person"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="preferredName">Preferred Name</label>
            <input
              type="text"
              id="preferredName"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday">Birthday</label>
            <input
              type="text"
              id="birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as "M" | "F" | "O")}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="isArchived">Archived</label>
            <input
              type="checkbox"
              id="isArchived"
              checked={isArchived}
              onChange={(e) => setIsArchived(e.target.checked)}
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

export default PeopleCRUD;

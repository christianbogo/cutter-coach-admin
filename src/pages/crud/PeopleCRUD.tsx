import React, { useState, useRef } from "react";
import { usePeopleContext } from "../../contexts/PeopleContext";
import { Person } from "../../models/index";
import * as XLSX from "xlsx";

import "../../styles/crud-page.css";

const PeopleCRUD: React.FC = () => {
  const { people, loading, error, createPerson, updatePerson, deletePerson, bulkCreatePeople } =
    usePeopleContext();
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Person | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the file input
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);

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

  // --- Bulk Upload Handler ---
  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setBulkUploadLoading(true);
      setBulkUploadError(null);
      const allParsedData: Omit<Person, "id" | "createdAt" | "updatedAt">[] = [];

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const parsedData: Omit<Person, "id" | "createdAt" | "updatedAt">[] =
            XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Assuming the first row is the header, extract data from the following rows
          const headers = parsedData[0] as unknown as string[];
          const peopleData = (parsedData.slice(1) as unknown as any[][]).map((row: any[]) => {
            const person: Omit<Person, "id" | "createdAt" | "updatedAt"> = {
              firstName: row[headers.indexOf("firstName")],
              preferredName: row[headers.indexOf("preferredName")] || "", // Handle potential missing values
              lastName: row[headers.indexOf("lastName")],
              birthday: row[headers.indexOf("birthday")],
              gender: row[headers.indexOf("gender")],
              phone: row[headers.indexOf("phone")] || "",
              email: row[headers.indexOf("email")] || "",
              isArchived: false, // Default value for isArchived
            };
            return person;
          });
          allParsedData.push(...peopleData);
        }

        if (allParsedData.length > 0) {
          await bulkCreatePeople(allParsedData);
        } else {
          setBulkUploadError("No data found in the selected files.");
        }
      } catch (error: any) {
        setBulkUploadError(`Error reading or processing Excel files: ${error.message}`);
      } finally {
        setBulkUploadLoading(false);
        // Optionally clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">People</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Person
        </button>
        <div>
          <input
            className="crud-button bulk-upload-button"
            type="file"
            multiple
            accept=".xlsx"
            onChange={handleBulkUpload}
            ref={fileInputRef}
          />
          {bulkUploadLoading && <p>Uploading and processing files...</p>}
          {bulkUploadError && <p className="error-message">Bulk Upload Error: {bulkUploadError}</p>}
        </div>
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

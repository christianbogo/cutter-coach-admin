import React, { useState } from "react";
import { useContactContext } from "../../contexts/ContactContext";
import { Contact, Person } from "../../models/index";
import "../../styles/crud-page.css";

const ContactCRUD: React.FC = () => {
  const { contacts, loading, error, createContact, updateContact, deleteContact, people } =
    useContactContext();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Contact | null;
    direction: "ascending" | "descending" | null;
  }>({ key: null, direction: null });
  const [filterValue, setFilterValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Sorting ---
  const requestSort = (key: keyof Contact) => {
    let direction: "ascending" | "descending" | null = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  let sortedContacts = [...contacts];
  if (sortConfig.key !== null) {
    const key = sortConfig.key;

    sortedContacts.sort((a, b) => {
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
  const filteredContacts = sortedContacts.filter((contact) => {
    return Object.values(contact).some((value) =>
      String(value).toLowerCase().includes(filterValue.toLowerCase())
    );
  });

  // --- Modal Handlers ---
  const openModal = (contact: Contact | null = null) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedContact(null);
    setIsModalOpen(false);
  };

  // Handlers to pass to the modal
  const handleCreateContact = async (newContact: Contact) => {
    await createContact(newContact);
    closeModal();
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    await updateContact(updatedContact);
    closeModal();
  };

  // Helper functions to get names from IDs
  const getPersonName = (personId: string | undefined) => {
    if (!personId) return "None";
    const person = people.find((p) => p.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : "Unknown Person";
  };

  return (
    <div className="crud-container">
      <h1 className="crud-title">Contacts</h1>

      <div className="crud-toolbar">
        <button className="crud-button create-button" onClick={() => openModal()}>
          Add Contact
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
                <th onClick={() => requestSort("contact")}>
                  Contact{" "}
                  {sortConfig.key === "contact" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("relationship")}>
                  Relationship{" "}
                  {sortConfig.key === "relationship" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("recipient")}>
                  Recipient{" "}
                  {sortConfig.key === "recipient" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("isEmergency")}>
                  Emergency{" "}
                  {sortConfig.key === "isEmergency" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th onClick={() => requestSort("recievesEmail")}>
                  Email{" "}
                  {sortConfig.key === "recievesEmail" &&
                    (sortConfig.direction === "ascending" ? "▲" : "▼")}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="table-cell-contact">{getPersonName(contact.contact)}</td>
                  <td className="table-cell-relationship">{contact.relationship}</td>
                  <td className="table-cell-recipient">{getPersonName(contact.recipient)}</td>
                  <td className="table-cell-isEmergency">{contact.isEmergency ? "Yes" : "No"}</td>
                  <td className="table-cell-recievesEmail">
                    {contact.recievesEmail ? "Yes" : "No"}
                  </td>
                  <td className="table-cell-actions">
                    <button className="crud-button edit-button" onClick={() => openModal(contact)}>
                      Edit
                    </button>
                    <button
                      className="crud-button delete-button"
                      onClick={() => deleteContact(contact.id)}
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
        <ContactModal
          contact={selectedContact}
          onClose={closeModal}
          onCreate={handleCreateContact}
          onUpdate={handleUpdateContact}
          people={people}
        />
      )}
    </div>
  );
};

// --- Contact Modal Component ---
const ContactModal: React.FC<{
  contact: Contact | null;
  onClose: () => void;
  onCreate: (contact: Contact) => void;
  onUpdate: (contact: Contact) => void;
  people: Person[];
}> = ({ contact, onClose, onCreate, onUpdate, people }) => {
  const [contactPerson, setContactPerson] = useState(contact?.contact || "");
  const [relationship, setRelationship] = useState(contact?.relationship || "");
  const [recipient, setRecipient] = useState(contact?.recipient || "");
  const [isEmergency, setIsEmergency] = useState(contact?.isEmergency || false);
  const [recievesEmail, setRecievesEmail] = useState(contact?.recievesEmail || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData: Contact = {
      id: contact?.id || String(Date.now()),
      contact: contactPerson,
      relationship,
      recipient,
      isEmergency,
      recievesEmail,
    };
    if (contact) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
  };

  return (
    <div className="crud-modal-overlay">
      <div className="crud-modal">
        <h2 className="modal-title">{contact ? "Edit Contact" : "Add Contact"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="contact">Contact Person</label>
            <select
              id="contact"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            >
              <option value="">None</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="relationship">Relationship</label>
            <input
              type="text"
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="recipient">Recipient Person</label>
            <select id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)}>
              <option value="">None</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="isEmergency">Is Emergency Contact</label>
            <input
              type="checkbox"
              id="isEmergency"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="recievesEmail">Receives Email</label>
            <input
              type="checkbox"
              id="recievesEmail"
              checked={recievesEmail}
              onChange={(e) => setRecievesEmail(e.target.checked)}
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

export default ContactCRUD;

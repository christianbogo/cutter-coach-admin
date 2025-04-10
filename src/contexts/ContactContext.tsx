import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Contact, Person } from "../models/index";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

interface ContactContextType {
  contacts: Contact[];
  setContacts: Dispatch<SetStateAction<Contact[]>>;
  loading: boolean;
  error: string | null;
  fetchContacts: () => Promise<void>;
  createContact: (contact: Contact) => Promise<void>;
  updateContact: (contact: Contact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  people: Person[];
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);

  const contactsCollectionRef = collection(db, "contacts");
  const peopleCollectionRef = collection(db, "people");

  // --- Fetch Helper Collections ---
  const fetchHelperCollections = async () => {
    try {
      const peopleSnapshot = await getDocs(peopleCollectionRef);
      const fetchedPeople: Person[] = [];
      peopleSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPeople.push({
          id: doc.id,
          firstName: data.firstName,
          preferredName: data.preferredName,
          lastName: data.lastName,
          birthday: data.birthday,
          gender: data.gender,
          phone: data.phone,
          email: data.email,
          isArchived: data.isArchived,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setPeople(fetchedPeople);
    } catch (err: any) {
      setError(err.message || "Error fetching people");
    }
  };

  // --- Data Fetching from Firestore ---
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(contactsCollectionRef);
      const fetchedContacts: Contact[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedContacts.push({
          id: doc.id,
          contact: data.contact,
          relationship: data.relationship,
          recipient: data.recipient,
          isEmergency: data.isEmergency,
          recievesEmail: data.recievesEmail,
        });
      });
      setContacts(fetchedContacts);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching contacts");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createContact = async (newContact: Contact) => {
    try {
      await addDoc(contactsCollectionRef, {
        contact: newContact.contact,
        relationship: newContact.relationship,
        recipient: newContact.recipient,
        isEmergency: newContact.isEmergency,
        recievesEmail: newContact.recievesEmail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchContacts();
    } catch (err: any) {
      setError(err.message || "Error creating contact");
    }
  };

  const updateContact = async (updatedContact: Contact) => {
    try {
      const contactDocRef = doc(db, "contacts", updatedContact.id);
      await updateDoc(contactDocRef, {
        contact: updatedContact.contact,
        relationship: updatedContact.relationship,
        recipient: updatedContact.recipient,
        isEmergency: updatedContact.isEmergency,
        recievesEmail: updatedContact.recievesEmail,
        updatedAt: Timestamp.now(),
      });
      await fetchContacts();
    } catch (err: any) {
      setError(err.message || "Error updating contact");
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const contactDocRef = doc(db, "contacts", id);
      await deleteDoc(contactDocRef);
      await fetchContacts();
    } catch (err: any) {
      setError(err.message || "Error deleting contact");
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchHelperCollections(); // Fetch people on mount
  }, []);

  const value: ContactContextType = {
    contacts,
    setContacts,
    loading,
    error,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    people,
  };

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};

export const useContactContext = () => {
  const context = React.useContext(ContactContext);
  if (context === undefined) {
    throw new Error("useContactContext must be used within a ContactProvider");
  }
  return context;
};

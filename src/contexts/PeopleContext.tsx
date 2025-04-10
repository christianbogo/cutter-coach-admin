import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Person } from "../models/index";
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

interface PeopleContextType {
  people: Person[];
  setPeople: Dispatch<SetStateAction<Person[]>>;
  loading: boolean;
  error: string | null;
  fetchPeople: () => Promise<void>;
  createPerson: (person: Person) => Promise<void>;
  updatePerson: (person: Person) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
}

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export const PeopleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const peopleCollectionRef = collection(db, "people");

  // --- Data Fetching from Firestore ---
  const fetchPeople = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(peopleCollectionRef);
      const fetchedPeople: Person[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPeople.push({
          id: doc.id,
          firstName: data.firstName,
          preferredName: data.preferredName,
          lastName: data.lastName,
          birthday: data.birthday,
          gender: data.gender,
          phone: data.phone, // Add phone
          email: data.email, // Add email
          isArchived: data.isArchived,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setPeople(fetchedPeople);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching people");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createPerson = async (newPerson: Person) => {
    try {
      await addDoc(peopleCollectionRef, {
        firstName: newPerson.firstName,
        preferredName: newPerson.preferredName,
        lastName: newPerson.lastName,
        birthday: newPerson.birthday,
        gender: newPerson.gender,
        phone: newPerson.phone, // Add phone
        email: newPerson.email, // Add email
        isArchived: newPerson.isArchived,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchPeople();
    } catch (err: any) {
      setError(err.message || "Error creating person");
    }
  };

  const updatePerson = async (updatedPerson: Person) => {
    try {
      const personDocRef = doc(db, "people", updatedPerson.id);
      await updateDoc(personDocRef, {
        firstName: updatedPerson.firstName,
        preferredName: updatedPerson.preferredName,
        lastName: updatedPerson.lastName,
        birthday: updatedPerson.birthday,
        gender: updatedPerson.gender,
        phone: updatedPerson.phone, // Add phone
        email: updatedPerson.email, // Add email
        isArchived: updatedPerson.isArchived,
        updatedAt: Timestamp.now(),
      });
      await fetchPeople();
    } catch (err: any) {
      setError(err.message || "Error updating person");
    }
  };

  const deletePerson = async (id: string) => {
    try {
      const personDocRef = doc(db, "people", id);
      await deleteDoc(personDocRef);
      await fetchPeople();
    } catch (err: any) {
      setError(err.message || "Error deleting person");
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const value: PeopleContextType = {
    people,
    setPeople,
    loading,
    error,
    fetchPeople,
    createPerson,
    updatePerson,
    deletePerson,
  };

  return <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>;
};

export const usePeopleContext = () => {
  const context = React.useContext(PeopleContext);
  if (context === undefined) {
    throw new Error("usePeopleContext must be used within a PeopleProvider");
  }
  return context;
};

import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { RelayResult, Meet, Event, Athlete, Person } from "../models/index";
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

interface RelayResultContextType {
  relayResults: RelayResult[];
  setRelayResults: Dispatch<SetStateAction<RelayResult[]>>;
  loading: boolean;
  error: string | null;
  fetchRelayResults: () => Promise<void>;
  createRelayResult: (relayResult: Omit<RelayResult, "id">) => Promise<void>;
  updateRelayResult: (relayResult: Omit<RelayResult, "id"> & { id: string }) => Promise<void>;
  deleteRelayResult: (id: string) => Promise<void>;
  meets: Meet[];
  events: Event[];
  athletes: Athlete[];
  persons: Person[]; // Add persons to the context
}

const RelayResultContext = createContext<RelayResultContextType | undefined>(undefined);

export const RelayResultProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [relayResults, setRelayResults] = useState<RelayResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [persons, setPersons] = useState<Person[]>([]); // Add persons state

  const relayResultsCollectionRef = collection(db, "relayResults");
  const meetsCollectionRef = collection(db, "meets");
  const eventsCollectionRef = collection(db, "events");
  const athletesCollectionRef = collection(db, "athletes");
  const personsCollectionRef = collection(db, "people"); // Get people

  // --- Fetch Helper Collections ---
  const fetchHelperCollections = async () => {
    try {
      const meetsSnapshot = await getDocs(meetsCollectionRef);
      const fetchedMeets: Meet[] = [];
      meetsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMeets.push({
          id: doc.id,
          nameLong: data.nameLong,
          nameShort: data.nameShort,
          date: data.date,
          season: data.season,
          eventOrder: data.eventOrder,
          isComplete: data.isComplete,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setMeets(fetchedMeets);

      const eventsSnapshot = await getDocs(eventsCollectionRef);
      const fetchedEvents: Event[] = [];
      eventsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedEvents.push({
          id: doc.id,
          code: data.code,
          nameLong: data.nameLong,
          nameShort: data.nameShort,
          course: data.course,
          distance: data.distance,
          stroke: data.stroke,
          official: data.official,
        });
      });
      setEvents(fetchedEvents);

      const athletesSnapshot = await getDocs(athletesCollectionRef);
      const fetchedAthletes: Athlete[] = [];
      athletesSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAthletes.push({
          id: doc.id,
          person: data.person,
          season: data.season,
          team: data.team,
          grade: data.grade,
          group: data.group,
          subgroup: data.subgroup,
          lane: data.lane,
          hasDisability: data.hasDisability,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setAthletes(fetchedAthletes);

      const personsSnapshot = await getDocs(personsCollectionRef);
      const fetchedPersons: Person[] = [];
      personsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPersons.push({
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
      setPersons(fetchedPersons);
    } catch (err: any) {
      setError(err.message || "Error fetching helper collections");
    }
  };

  // --- Data Fetching from Firestore ---
  const fetchRelayResults = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(relayResultsCollectionRef);
      const fetchedRelayResults: RelayResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedRelayResults.push({
          id: doc.id,
          meet: data.meet,
          event: data.event,
          athletes: data.athletes,
          team: data.team,
          season: data.season,
          result: data.result,
          dq: data.dq,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setRelayResults(fetchedRelayResults);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching relay results");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createRelayResult = async (newRelayResult: Omit<RelayResult, "id">) => {
    try {
      const athlete = athletes.find((a) => a.id === newRelayResult.athletes[0]); // Get data from first athlete.
      const meet = meets.find((m) => m.id === newRelayResult.meet);

      if (!athlete || !meet) {
        throw new Error("Athlete or Meet data is missing. Cannot create relay result.");
      }
      const team = athlete.team;
      const season = meet.season;

      await addDoc(relayResultsCollectionRef, {
        meet: newRelayResult.meet,
        event: newRelayResult.event,
        athletes: newRelayResult.athletes,
        team: team,
        season: season,
        result: newRelayResult.result,
        dq: newRelayResult.dq,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchRelayResults();
    } catch (err: any) {
      setError(err.message || "Error creating relay result");
    }
  };

  const updateRelayResult = async (
    updatedRelayResult: Omit<RelayResult, "id"> & { id: string }
  ) => {
    try {
      const athlete = athletes.find((a) => a.id === updatedRelayResult.athletes[0]); // get data from first athlete.
      const meet = meets.find((m) => m.id === updatedRelayResult.meet);
      if (!athlete || !meet) {
        throw new Error("Athlete or Meet data is missing. Cannot update relay result.");
      }
      const team = athlete.team;
      const season = meet.season;

      const relayResultDocRef = doc(db, "relayResults", updatedRelayResult.id);
      await updateDoc(relayResultDocRef, {
        meet: updatedRelayResult.meet,
        event: updatedRelayResult.event,
        athletes: updatedRelayResult.athletes,
        team: team,
        season: season,
        result: updatedRelayResult.result,
        dq: updatedRelayResult.dq,
        updatedAt: Timestamp.now(),
      });
      await fetchRelayResults();
    } catch (err: any) {
      setError(err.message || "Error updating relay result");
    }
  };

  const deleteRelayResult = async (id: string) => {
    try {
      const relayResultDocRef = doc(db, "relayResults", id);
      await deleteDoc(relayResultDocRef);
      await fetchRelayResults();
    } catch (err: any) {
      setError(err.message || "Error deleting relay result");
    }
  };

  useEffect(() => {
    fetchRelayResults();
    fetchHelperCollections(); // Fetch meets, events, and athletes on mount
  }, []);

  const value: RelayResultContextType = {
    relayResults,
    setRelayResults,
    loading,
    error,
    fetchRelayResults,
    createRelayResult,
    updateRelayResult,
    deleteRelayResult,
    meets,
    events,
    athletes,
    persons, // Provide persons
  };

  return <RelayResultContext.Provider value={value}>{children}</RelayResultContext.Provider>;
};

export const useRelayResultContext = () => {
  const context = React.useContext(RelayResultContext);
  if (context === undefined) {
    throw new Error("useRelayResultContext must be used within a RelayResultProvider");
  }
  return context;
};

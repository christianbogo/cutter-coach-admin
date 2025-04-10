import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { IndividualResult, Meet, Event, Athlete, Person } from "../models/index";
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

interface IndividualResultContextType {
  individualResults: IndividualResult[];
  setIndividualResults: Dispatch<SetStateAction<IndividualResult[]>>;
  loading: boolean;
  error: string | null;
  fetchIndividualResults: () => Promise<void>;
  createIndividualResult: (
    individualResult: Omit<IndividualResult, "id" | "team" | "season" | "age">
  ) => Promise<void>;
  updateIndividualResult: (
    individualResult: Omit<IndividualResult, "team" | "season" | "age">
  ) => Promise<void>;
  deleteIndividualResult: (id: string) => Promise<void>;
  meets: Meet[];
  events: Event[];
  athletes: Athlete[];
  persons: Person[];
}

const IndividualResultContext = createContext<IndividualResultContextType | undefined>(undefined);

export const IndividualResultProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [individualResults, setIndividualResults] = useState<IndividualResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meets, setMeets] = useState<Meet[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);

  const individualResultsCollectionRef = collection(db, "individualResults");
  const meetsCollectionRef = collection(db, "meets");
  const eventsCollectionRef = collection(db, "events");
  const athletesCollectionRef = collection(db, "athletes");

  useEffect(() => {
    console.log("persons:", persons);
    console.log("athletes:", athletes);
  }, [persons, athletes]);

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

      const personsSnapshot = await getDocs(collection(db, "people"));
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
  const fetchIndividualResults = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(individualResultsCollectionRef);
      const fetchedIndividualResults: IndividualResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedIndividualResults.push({
          id: doc.id,
          meet: data.meet,
          event: data.event,
          athlete: data.athlete,
          team: data.team,
          season: data.season,
          age: data.age,
          result: data.result,
          dq: data.dq,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setIndividualResults(fetchedIndividualResults);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching individual results");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createIndividualResult = async (
    newIndividualResult: Omit<IndividualResult, "id" | "team" | "season" | "age">
  ) => {
    try {
      const athlete = athletes.find((a) => a.id === newIndividualResult.athlete);
      const meet = meets.find((m) => m.id === newIndividualResult.meet);
      const person = athlete ? persons.find((p) => p.id === athlete.person) : null;

      if (!athlete || !meet || !person) {
        throw new Error(
          "Unable to calculate team, season, or age due to missing athlete, meet, or person."
        );
      }

      const team = athlete.team;
      const season = athlete.season;

      // Calculate age
      const birthDate = new Date(person.birthday);
      const meetDate = new Date(meet.date);
      let age = meetDate.getFullYear() - birthDate.getFullYear();
      const birthMonthDay = `${birthDate.getMonth()}-${birthDate.getDate()}`;
      const meetMonthDay = `${meetDate.getMonth()}-${meetDate.getDate()}`;
      if (meetMonthDay < birthMonthDay) {
        age -= 1;
      }

      await addDoc(individualResultsCollectionRef, {
        meet: newIndividualResult.meet,
        event: newIndividualResult.event,
        athlete: newIndividualResult.athlete,
        team,
        season,
        age,
        result: newIndividualResult.result,
        dq: newIndividualResult.dq,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      await fetchIndividualResults();
    } catch (err: any) {
      setError(err.message || "Error creating individual result");
    }
  };

  const updateIndividualResult = async (
    updatedIndividualResult: Omit<IndividualResult, "team" | "season" | "age">
  ) => {
    try {
      const individualResultDocRef = doc(db, "individualResults", updatedIndividualResult.id);
      await updateDoc(individualResultDocRef, {
        meet: updatedIndividualResult.meet,
        event: updatedIndividualResult.event,
        athlete: updatedIndividualResult.athlete,
        result: updatedIndividualResult.result,
        dq: updatedIndividualResult.dq,
        updatedAt: Timestamp.now(),
      });
      await fetchIndividualResults();
    } catch (err: any) {
      setError(err.message || "Error updating individual result");
    }
  };

  const deleteIndividualResult = async (id: string) => {
    try {
      const individualResultDocRef = doc(db, "individualResults", id);
      await deleteDoc(individualResultDocRef);
      await fetchIndividualResults();
    } catch (err: any) {
      setError(err.message || "Error deleting individual result");
    }
  };

  useEffect(() => {
    fetchIndividualResults();
    fetchHelperCollections(); // Fetch meets, events, and athletes on mount
  }, []);

  const value: IndividualResultContextType = {
    individualResults,
    setIndividualResults,
    loading,
    error,
    fetchIndividualResults,
    createIndividualResult,
    updateIndividualResult,
    deleteIndividualResult,
    meets,
    events,
    athletes,
    persons,
  };

  return (
    <IndividualResultContext.Provider value={value}>{children}</IndividualResultContext.Provider>
  );
};

export const useIndividualResultContext = () => {
  const context = React.useContext(IndividualResultContext);
  if (context === undefined) {
    throw new Error("useIndividualResultContext must be used within a IndividualResultProvider");
  }
  return context;
};

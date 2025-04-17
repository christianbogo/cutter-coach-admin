import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Athlete, Person, Season, Team } from "../models/index";
import { db } from "../config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

interface AthleteContextType {
  athletes: Athlete[];
  setAthletes: Dispatch<SetStateAction<Athlete[]>>;
  loading: boolean;
  error: string | null;
  fetchAthletes: () => Promise<void>;
  createAthlete: (athlete: Athlete) => Promise<void>;
  updateAthlete: (athlete: Athlete) => Promise<void>;
  deleteAthlete: (id: string) => Promise<void>;
  people: Person[];
  seasons: Season[];
  teams: Team[];
  bulkCreateAthletes: (
    // New function
    athletesToAdd: Omit<Athlete, "id" | "createdAt" | "updatedAt">[]
  ) => Promise<void>;
}

const AthleteContext = createContext<AthleteContextType | undefined>(undefined);

export const AthleteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const athletesCollectionRef = collection(db, "athletes");
  const peopleCollectionRef = collection(db, "people");
  const seasonsCollectionRef = collection(db, "seasons");
  const teamsCollectionRef = collection(db, "teams");

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

      const seasonsSnapshot = await getDocs(seasonsCollectionRef);
      const fetchedSeasons: Season[] = [];
      seasonsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedSeasons.push({
          id: doc.id,
          team: data.team,
          nameLong: data.nameLong,
          nameShort: data.nameShort,
          startDate: data.startDate,
          endDate: data.endDate,
          isComplete: data.isComplete,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setSeasons(fetchedSeasons);

      const teamsSnapshot = await getDocs(teamsCollectionRef);
      const fetchedTeams: Team[] = [];
      teamsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedTeams.push({
          id: doc.id,
          code: data.code,
          type: data.type,
          nameLong: data.nameLong,
          nameShort: data.nameShort,
          currentSeason: data.currentSeason,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      setTeams(fetchedTeams);
    } catch (err: any) {
      setError(err.message || "Error fetching helper collections");
    }
  };

  // --- Data Fetching from Firestore ---
  const fetchAthletes = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(athletesCollectionRef);
      const fetchedAthletes: Athlete[] = [];
      querySnapshot.forEach((doc) => {
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching athletes");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createAthlete = async (newAthlete: Athlete) => {
    try {
      await addDoc(athletesCollectionRef, {
        person: newAthlete.person,
        season: newAthlete.season,
        team: newAthlete.team,
        grade: newAthlete.grade,
        group: newAthlete.group,
        subgroup: newAthlete.subgroup,
        lane: newAthlete.lane,
        hasDisability: newAthlete.hasDisability,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchAthletes();
    } catch (err: any) {
      setError(err.message || "Error creating athlete");
    }
  };

  const updateAthlete = async (updatedAthlete: Athlete) => {
    try {
      const athleteDocRef = doc(db, "athletes", updatedAthlete.id);
      await updateDoc(athleteDocRef, {
        person: updatedAthlete.person,
        season: updatedAthlete.season,
        team: updatedAthlete.team,
        grade: updatedAthlete.grade,
        group: updatedAthlete.group,
        subgroup: updatedAthlete.subgroup,
        lane: updatedAthlete.lane,
        hasDisability: updatedAthlete.hasDisability,
        updatedAt: Timestamp.now(),
      });
      await fetchAthletes();
    } catch (err: any) {
      setError(err.message || "Error updating athlete");
    }
  };

  const deleteAthlete = async (id: string) => {
    try {
      const athleteDocRef = doc(db, "athletes", id);
      await deleteDoc(athleteDocRef);
      await fetchAthletes();
    } catch (err: any) {
      setError(err.message || "Error deleting athlete");
    }
  };

  const bulkCreateAthletes = async (
    athletesToAdd: Omit<Athlete, "id" | "createdAt" | "updatedAt">[]
  ) => {
    setLoading(true);
    setError(null);

    const batch = writeBatch(db);
    athletesToAdd.forEach((athlete) => {
      const docRef = doc(athletesCollectionRef); // Firestore will auto-generate the ID
      batch.set(docRef, {
        ...athlete,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    try {
      await batch.commit();
      await fetchAthletes();
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error creating athletes in bulk");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
    fetchHelperCollections(); // Fetch people, seasons, and teams on mount
  }, []);

  const value: AthleteContextType = {
    athletes,
    setAthletes,
    loading,
    error,
    fetchAthletes,
    createAthlete,
    updateAthlete,
    deleteAthlete,
    people,
    seasons,
    teams,
    bulkCreateAthletes,
  };

  return <AthleteContext.Provider value={value}>{children}</AthleteContext.Provider>;
};

export const useAthleteContext = () => {
  const context = React.useContext(AthleteContext);
  if (context === undefined) {
    throw new Error("useAthleteContext must be used within a AthleteProvider");
  }
  return context;
};

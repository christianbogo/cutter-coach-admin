import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Season, Team } from "../models/index";
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

interface SeasonContextType {
  seasons: Season[];
  setSeasons: Dispatch<SetStateAction<Season[]>>;
  loading: boolean;
  error: string | null;
  fetchSeasons: () => Promise<void>;
  createSeason: (season: Season) => Promise<void>;
  updateSeason: (season: Season) => Promise<void>;
  deleteSeason: (id: string) => Promise<void>;
  teams: Team[]; // Add teams to the context
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]); // Initialize teams

  const seasonsCollectionRef = collection(db, "seasons");
  const teamsCollectionRef = collection(db, "teams"); // Reference to teams collection

  // --- Fetch Teams ---
  const fetchTeams = async () => {
    try {
      const querySnapshot = await getDocs(teamsCollectionRef);
      const fetchedTeams: Team[] = [];
      querySnapshot.forEach((doc) => {
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
      setError(err.message || "Error fetching teams");
    }
  };

  // --- Data Fetching from Firestore ---
  const fetchSeasons = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(seasonsCollectionRef);
      const fetchedSeasons: Season[] = [];
      querySnapshot.forEach((doc) => {
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching seasons");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createSeason = async (newSeason: Season) => {
    try {
      await addDoc(seasonsCollectionRef, {
        team: newSeason.team,
        nameLong: newSeason.nameLong,
        nameShort: newSeason.nameShort,
        startDate: newSeason.startDate,
        endDate: newSeason.endDate,
        isComplete: newSeason.isComplete,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchSeasons();
    } catch (err: any) {
      setError(err.message || "Error creating season");
    }
  };

  const updateSeason = async (updatedSeason: Season) => {
    try {
      const seasonDocRef = doc(db, "seasons", updatedSeason.id);
      await updateDoc(seasonDocRef, {
        team: updatedSeason.team,
        nameLong: updatedSeason.nameLong,
        nameShort: updatedSeason.nameShort,
        startDate: updatedSeason.startDate,
        endDate: updatedSeason.endDate,
        isComplete: updatedSeason.isComplete,
        updatedAt: Timestamp.now(),
      });
      await fetchSeasons();
    } catch (err: any) {
      setError(err.message || "Error updating season");
    }
  };

  const deleteSeason = async (id: string) => {
    try {
      const seasonDocRef = doc(db, "seasons", id);
      await deleteDoc(seasonDocRef);
      await fetchSeasons();
    } catch (err: any) {
      setError(err.message || "Error deleting season");
    }
  };

  useEffect(() => {
    fetchSeasons();
    fetchTeams(); // Fetch teams on component mount
  }, []);

  const value: SeasonContextType = {
    seasons,
    setSeasons,
    loading,
    error,
    fetchSeasons,
    createSeason,
    updateSeason,
    deleteSeason,
    teams,
  };

  return <SeasonContext.Provider value={value}>{children}</SeasonContext.Provider>;
};

export const useSeasonContext = () => {
  const context = React.useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeasonContext must be used within a SeasonProvider");
  }
  return context;
};

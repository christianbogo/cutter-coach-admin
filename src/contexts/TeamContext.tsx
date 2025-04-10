import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Team, Season } from "../models/index"; // Import Team and Season interfaces
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

interface TeamContextType {
  teams: Team[];
  setTeams: Dispatch<SetStateAction<Team[]>>;
  loading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  createTeam: (team: Team) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  seasons: Season[]; // Add seasons to the context
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]); // Initialize seasons

  const teamsCollectionRef = collection(db, "teams");
  const seasonsCollectionRef = collection(db, "seasons"); // Reference to seasons collection

  // --- Fetch Seasons ---
  const fetchSeasons = async () => {
    try {
      const querySnapshot = await getDocs(seasonsCollectionRef);
      const fetchedSeasons: Season[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedSeasons.push({
          id: doc.id,
          team: data.team, // Assuming team is a reference or ID
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
    } catch (err: any) {
      setError(err.message || "Error fetching seasons");
    }
  };

  // --- Data Fetching from Firestore ---
  const fetchTeams = async () => {
    setLoading(true);
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching teams");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createTeam = async (newTeam: Team) => {
    try {
      await addDoc(teamsCollectionRef, {
        code: newTeam.code,
        type: newTeam.type,
        nameLong: newTeam.nameLong,
        nameShort: newTeam.nameShort,
        currentSeason: newTeam.currentSeason,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchTeams();
    } catch (err: any) {
      setError(err.message || "Error creating team");
    }
  };

  const updateTeam = async (updatedTeam: Team) => {
    try {
      const teamDocRef = doc(db, "teams", updatedTeam.id);
      await updateDoc(teamDocRef, {
        code: updatedTeam.code,
        type: updatedTeam.type,
        nameLong: updatedTeam.nameLong,
        nameShort: updatedTeam.nameShort,
        currentSeason: updatedTeam.currentSeason,
        updatedAt: Timestamp.now(),
      });
      await fetchTeams();
    } catch (err: any) {
      setError(err.message || "Error updating team");
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      const teamDocRef = doc(db, "teams", id);
      await deleteDoc(teamDocRef);
      await fetchTeams();
    } catch (err: any) {
      setError(err.message || "Error deleting team");
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchSeasons(); // Fetch seasons on component mount
  }, []);

  const value: TeamContextType = {
    teams,
    setTeams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    seasons,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeamContext = () => {
  const context = React.useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
};

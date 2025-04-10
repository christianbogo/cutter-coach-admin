import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Meet, Season, Event } from "../models/index";
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

interface MeetContextType {
  meets: Meet[];
  setMeets: Dispatch<SetStateAction<Meet[]>>;
  loading: boolean;
  error: string | null;
  fetchMeets: () => Promise<void>;
  createMeet: (meet: Meet) => Promise<void>;
  updateMeet: (meet: Meet) => Promise<void>;
  deleteMeet: (id: string) => Promise<void>;
  seasons: Season[];
  events: Event[];
}

const MeetContext = createContext<MeetContextType | undefined>(undefined);

export const MeetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meets, setMeets] = useState<Meet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const meetsCollectionRef = collection(db, "meets");
  const seasonsCollectionRef = collection(db, "seasons");
  const eventsCollectionRef = collection(db, "events");

  // --- Fetch Helper Collections ---
  const fetchHelperCollections = async () => {
    try {
      const seasonsSnapshot = await getDocs(seasonsCollectionRef);
      const fetchedSeasons: Season[] = [];
      seasonsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedSeasons.push({
          id: doc.id,
          team: data.team, // Add the missing 'team' property
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
    } catch (err: any) {
      setError(err.message || "Error fetching helper collections");
    }
  };

  // --- Data Fetching from Firestore ---
  const fetchMeets = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(meetsCollectionRef);
      const fetchedMeets: Meet[] = [];
      querySnapshot.forEach((doc) => {
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching meets");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createMeet = async (newMeet: Meet) => {
    try {
      await addDoc(meetsCollectionRef, {
        nameLong: newMeet.nameLong,
        nameShort: newMeet.nameShort,
        date: newMeet.date,
        season: newMeet.season,
        eventOrder: newMeet.eventOrder,
        isComplete: newMeet.isComplete,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchMeets();
    } catch (err: any) {
      setError(err.message || "Error creating meet");
    }
  };

  const updateMeet = async (updatedMeet: Meet) => {
    try {
      const meetDocRef = doc(db, "meets", updatedMeet.id);
      await updateDoc(meetDocRef, {
        nameLong: updatedMeet.nameLong,
        nameShort: updatedMeet.nameShort,
        date: updatedMeet.date,
        season: updatedMeet.season,
        eventOrder: updatedMeet.eventOrder,
        isComplete: updatedMeet.isComplete,
        updatedAt: Timestamp.now(),
      });
      await fetchMeets();
    } catch (err: any) {
      setError(err.message || "Error updating meet");
    }
  };

  const deleteMeet = async (id: string) => {
    try {
      const meetDocRef = doc(db, "meets", id);
      await deleteDoc(meetDocRef);
      await fetchMeets();
    } catch (err: any) {
      setError(err.message || "Error deleting meet");
    }
  };

  useEffect(() => {
    fetchMeets();
    fetchHelperCollections(); // Fetch seasons and events on mount
  }, []);

  const value: MeetContextType = {
    meets,
    setMeets,
    loading,
    error,
    fetchMeets,
    createMeet,
    updateMeet,
    deleteMeet,
    seasons,
    events,
  };

  return <MeetContext.Provider value={value}>{children}</MeetContext.Provider>;
};

export const useMeetContext = () => {
  const context = React.useContext(MeetContext);
  if (context === undefined) {
    throw new Error("useMeetContext must be used within a MeetProvider");
  }
  return context;
};

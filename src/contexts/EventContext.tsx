import React, { createContext, useState, useEffect, Dispatch, SetStateAction } from "react";
import { Event } from "../models/index";
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

interface EventContextType {
  events: Event[];
  setEvents: Dispatch<SetStateAction<Event[]>>;
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (event: Event) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventsCollectionRef = collection(db, "events");

  // --- Data Fetching from Firestore ---
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(eventsCollectionRef);
      const fetchedEvents: Event[] = [];
      querySnapshot.forEach((doc) => {
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
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error fetching events");
      setLoading(false);
    }
  };

  // --- CRUD Operations with Firestore ---
  const createEvent = async (newEvent: Event) => {
    try {
      await addDoc(eventsCollectionRef, {
        code: newEvent.code,
        nameLong: newEvent.nameLong,
        nameShort: newEvent.nameShort,
        course: newEvent.course,
        distance: newEvent.distance,
        stroke: newEvent.stroke,
        official: newEvent.official,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || "Error creating event");
    }
  };

  const updateEvent = async (updatedEvent: Event) => {
    try {
      const eventDocRef = doc(db, "events", updatedEvent.id);
      await updateDoc(eventDocRef, {
        code: updatedEvent.code,
        nameLong: updatedEvent.nameLong,
        nameShort: updatedEvent.nameShort,
        course: updatedEvent.course,
        distance: updatedEvent.distance,
        stroke: updatedEvent.stroke,
        official: updatedEvent.official,
        updatedAt: Timestamp.now(),
      });
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || "Error updating event");
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const eventDocRef = doc(db, "events", id);
      await deleteDoc(eventDocRef);
      await fetchEvents();
    } catch (err: any) {
      setError(err.message || "Error deleting event");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const value: EventContextType = {
    events,
    setEvents,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEventContext = () => {
  const context = React.useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEventContext must be used within a EventProvider");
  }
  return context;
};

import { Timestamp } from "firebase/firestore";

export interface Person {
  id: string;
  firstName: string;
  preferredName: string;
  lastName: string;
  birthday: string; // 'YYYY-MM-DD'
  gender: "M" | "F" | "O";

  isArchived: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Athlete {
  id: string;
  person: string; // references personId
  season: string; // references seasonId
  team: string; // references teamId

  grade: number;
  group: string;
  subgroup: string;
  lane: number;

  hasDisability: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
export interface Contact {
  relationship: string;
  person: string; // references personId
}
export interface Team {
  id: string;
  code: string;
  type: string;
  nameLong: string;
  nameShort: string;
  currentSeason?: string; // references seasonId

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
export interface Season {
  id: string;
  nameLong: string;
  nameShort: string;

  startDate: string;
  endDate: string;

  isComplete: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
export interface Meet {
  id: string;
  nameLong: string;
  nameShort: string;
  date: string; // 'YYYY-MM-DD'

  season: string; // references seasonId

  eventOrder: string[]; // references eventId

  isComplete: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Event {
  id: string;
  code: string;
  nameLong: string;
  nameShort: string;
  course: string;
  distance: number;
  stroke: string;
  official: boolean;
}

export interface IndividualResult {
  id: string;

  meet: string; // references meetId
  event: string; // references eventId
  eventNumber: number;
  athlete: string; // references athleteId

  result: number;
  dq: boolean;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface RelayResult {
  id: string;

  meet: string; // references meetId
  event: string; // references eventId
  eventNumber: number;
  first: string; // references athleteId
  second: string; // references athleteId
  third: string; // references athleteId
  forth: string; // references athleteId

  result: number;
  dq: boolean;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

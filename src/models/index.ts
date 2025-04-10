import { Timestamp } from "firebase/firestore";

export interface Person {
  id: string;
  firstName: string;
  preferredName: string;
  lastName: string;
  birthday: string; // 'YYYY-MM-DD'
  gender: "M" | "F" | "O";

  phone: string;
  email: string;

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
  id: string;
  contact: string; // references personId
  relationship: string;
  recipient: string; // references personId
  isEmergency: boolean;
  recievesEmail: boolean;
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
  team: string; // references teamId
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
  athlete: string; // references athleteId

  team: string; // references teamId determined by the athlete's team
  season: string; // references seasonId determined by the athlete's season
  age: number; // calculated by determining the athlete's age at the time of the meet

  result: number;
  dq: boolean;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface RelayResult {
  id: string;

  meet: string; // references meetId
  event: string; // references eventId

  athletes: string[]; // references athleteId

  team: string; // references teamId determined by the athlete's team
  season: string; // references seasonId determined by the athlete's season

  result: number;
  dq: boolean;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

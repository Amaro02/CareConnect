import { db } from "./index";
export { db } from "./index";
import {
  facilities,
  users,
  classrooms,
  students,
  pointsLog,
  prizes,
  prizeRedemptions,
  dailyReports,
  reportPhotos,
  reportEntries,
  messages,
  sessions,
} from "./schema";

// Export all tables for convenience
export {
  facilities,
  users,
  classrooms,
  students,
  pointsLog,
  prizes,
  prizeRedemptions,
  dailyReports,
  reportPhotos,
  reportEntries,
  messages,
  sessions,
};

export type { Database } from "./index";
// AthleteBulkUpload.tsx

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useAthleteContext } from "../contexts/AthleteContext";
import { Athlete, Person, Season, Team } from "../models/index"; // Import your interfaces

interface AthleteBulkUploadProps {
  people: Person[];
  seasons: Season[];
  teams: Team[];
}

const AthleteBulkUpload: React.FC<AthleteBulkUploadProps> = ({ people, seasons, teams }) => {
  const { bulkCreateAthletes } = useAthleteContext();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [matchErrors, setMatchErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setProcessing(true);
    setUploadError(null);
    setMatchErrors([]);

    try {
      const file = files[0];
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

      // Assuming first row is header
      const headers = excelData[0] as string[];
      const athletesToAdd: Omit<Athlete, "id" | "createdAt" | "updatedAt">[] = [];
      const currentMatchErrors: string[] = [];

      for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i];
        const firstName = row[headers.indexOf("firstName")];
        const lastName = row[headers.indexOf("lastName")];

        // Find the Person (adjust this logic as needed for matching)
        const person = people.find((p) => p.firstName === firstName && p.lastName === lastName);

        if (person) {
          const athlete: Omit<Athlete, "id" | "createdAt" | "updatedAt"> = {
            person: person.id,
            season: row[headers.indexOf("seasonId")] || "", // Handle potential undefined
            team: row[headers.indexOf("teamId")] || "", // Handle potential undefined
            grade:
              row[headers.indexOf("grade")] !== undefined
                ? Number(row[headers.indexOf("grade")])
                : 9, // Default to 9
            group: row[headers.indexOf("group")] || "",
            subgroup: row[headers.indexOf("subgroup")] || "",
            lane:
              row[headers.indexOf("lane")] !== undefined ? Number(row[headers.indexOf("lane")]) : 0, // Default to 1
            hasDisability: row[headers.indexOf("hasDisability")] || false,
          };
          athletesToAdd.push(athlete);
        } else {
          currentMatchErrors.push(
            `No matching person found for ${firstName} ${lastName} (row ${i + 1})`
          );
        }
      }

      if (currentMatchErrors.length > 0) {
        setMatchErrors(currentMatchErrors);
        setUploadError("Some athletes could not be matched. See errors below.");
      } else if (athletesToAdd.length > 0) {
        await bulkCreateAthletes(athletesToAdd);
        // Success message, clear input, etc. (You'll add this)
      } else {
        setUploadError("No athletes to add.");
      }
    } catch (error: any) {
      setUploadError(`Error processing file: ${error.message}`);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <input
        className="crud-button bulk-upload-button"
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        ref={fileInputRef}
      />
      {processing && <p>Processing...</p>}
      {uploadError && <p className="error-message">{uploadError}</p>}
      {matchErrors.length > 0 && (
        <div>
          <h2>Matching Errors:</h2>
          <ul>
            {matchErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Success message, etc. (You'll add this) */}
    </div>
  );
};

export default AthleteBulkUpload;

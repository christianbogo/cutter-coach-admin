import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import PeopleCRUD from "./pages/crud/PeopleCRUD";
import { PeopleProvider } from "./contexts/PeopleContext";
import { TeamProvider } from "./contexts/TeamContext";
import TeamCRUD from "./pages/crud/TeamCRUD";
import { SeasonProvider } from "./contexts/SeasonContext";
import SeasonCRUD from "./pages/crud/SeasonCRUD";
import { AthleteProvider } from "./contexts/AthleteContext";
import AthleteCRUD from "./pages/crud/AthleteCRUD";
import ContactCRUD from "./pages/crud/ContactCRUD";
import { ContactProvider } from "./contexts/ContactContext";
import { EventProvider } from "./contexts/EventContext";
import EventCRUD from "./pages/crud/EventCRUD";
import { MeetProvider } from "./contexts/MeetContext";
import MeetCRUD from "./pages/crud/MeetCRUD";
import { IndividualResultProvider } from "./contexts/IndividualResultContext";
import IndividualResultCRUD from "./pages/crud/IndividualResultCRUD";
import { RelayResultProvider } from "./contexts/RelayResultContext";
import RelayResultCRUD from "./pages/crud/RelayResultCRUD";

// Import other components as needed

function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <PeopleProvider>
          <TeamProvider>
            <SeasonProvider>
              <AthleteProvider>
                <ContactProvider>
                  <EventProvider>
                    <MeetProvider>
                      <IndividualResultProvider>
                        <RelayResultProvider>
                          <Routes>
                            <Route path="/people" element={<PeopleCRUD />} />
                            <Route path="/teams" element={<TeamCRUD />} />
                            <Route path="/seasons" element={<SeasonCRUD />} />
                            <Route path="/athletes" element={<AthleteCRUD />} />
                            <Route path="/contacts" element={<ContactCRUD />} />
                            <Route path="/events" element={<EventCRUD />} />
                            <Route path="/meets" element={<MeetCRUD />} />
                            <Route path="/ind-results" element={<IndividualResultCRUD />} />
                            <Route path="/relay-results" element={<RelayResultCRUD />} />

                            {/* Redirect to a default route */}
                            <Route path="/" element={<Navigate to="/people" replace />} />
                          </Routes>
                        </RelayResultProvider>
                      </IndividualResultProvider>
                    </MeetProvider>
                  </EventProvider>
                </ContactProvider>
              </AthleteProvider>
            </SeasonProvider>
          </TeamProvider>
        </PeopleProvider>
      </SidebarLayout>
    </BrowserRouter>
  );
}

export default App;

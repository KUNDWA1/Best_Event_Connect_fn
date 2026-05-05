import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import VendorProfile from "./pages/VendorProfile";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import PublicEvents from "./pages/PublicEvents";
import CallDemo from "./components/CallDemo";
import WorkingCallDemo from "./components/WorkingCallDemo";
import MinimalVideoCall from "./components/MinimalVideoCall";
import DashboardVoiceCallDemo from "./components/DashboardVoiceCallDemo";
import VoiceCallTest from "./components/VoiceCallTest";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planner/create-event" element={<CreateEvent />} />
            <Route path="/events" element={<PublicEvents />} />
            <Route path="/event" element={<PublicEvents />} />
            <Route path="/call-demo" element={<CallDemo />} />
            <Route path="/video-call" element={<WorkingCallDemo />} />
            <Route path="/test-video" element={<MinimalVideoCall />} />
            <Route path="/voice-call" element={<DashboardVoiceCallDemo />} />
            <Route path="/test-voice" element={<VoiceCallTest />} />
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

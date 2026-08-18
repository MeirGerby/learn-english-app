import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AdminPage from "@/pages/admin/AdminPage";
import CoursePage from "@/pages/course/CoursePage";
import PlacementTestPage from "@/pages/placement/PlacementTestPage";
import GamesListPage from "@/pages/games/GamesListPage";
import FlashcardsPage from "@/pages/games/flashcards/FlashcardsPage";
import ScramblePage from "@/pages/games/scramble/ScramblePage";
import FillBlankPage from "@/pages/games/fill-blank/FillBlankPage";
import ListeningPage from "@/pages/games/listening/ListeningPage";
import SpeedRoundPage from "@/pages/games/speed-round/SpeedRoundPage";
import { RequirePlacement } from "@/components/RequirePlacement";

export default function App() {
  return (
    <BrowserRouter basename="/learn-english-app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/placement-test" element={<PlacementTestPage />} />
        <Route
          path="/games"
          element={
            <RequirePlacement>
              <GamesListPage />
            </RequirePlacement>
          }
        />
        <Route
          path="/games/flashcards"
          element={
            <RequirePlacement>
              <FlashcardsPage />
            </RequirePlacement>
          }
        />
        <Route
          path="/games/scramble"
          element={
            <RequirePlacement>
              <ScramblePage />
            </RequirePlacement>
          }
        />
        <Route
          path="/games/fill-blank"
          element={
            <RequirePlacement>
              <FillBlankPage />
            </RequirePlacement>
          }
        />
        <Route
          path="/games/listening"
          element={
            <RequirePlacement>
              <ListeningPage />
            </RequirePlacement>
          }
        />
        <Route
          path="/games/speed-round"
          element={
            <RequirePlacement>
              <SpeedRoundPage />
            </RequirePlacement>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

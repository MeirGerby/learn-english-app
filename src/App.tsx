import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AdminPage from "@/pages/admin/AdminPage";
import FlashcardsPage from "@/pages/games/flashcards/FlashcardsPage";
import ScramblePage from "@/pages/games/scramble/ScramblePage";
import FillBlankPage from "@/pages/games/fill-blank/FillBlankPage";
import ListeningPage from "@/pages/games/listening/ListeningPage";
import SpeedRoundPage from "@/pages/games/speed-round/SpeedRoundPage";

export default function App() {
  return (
    <BrowserRouter basename="/learn-english-app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/games/flashcards" element={<FlashcardsPage />} />
        <Route path="/games/scramble" element={<ScramblePage />} />
        <Route path="/games/fill-blank" element={<FillBlankPage />} />
        <Route path="/games/listening" element={<ListeningPage />} />
        <Route path="/games/speed-round" element={<SpeedRoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

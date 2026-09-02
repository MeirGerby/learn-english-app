import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import AdminPage from "@/pages/admin/AdminPage";
import AccountPage from "@/pages/account/AccountPage";
import CoursePage from "@/pages/course/CoursePage";
import MaterialsPage from "@/pages/materials/MaterialsPage";
import PlacementTestPage from "@/pages/placement/PlacementTestPage";
import GamesListPage from "@/pages/games/GamesListPage";
import FlashcardsPage from "@/pages/games/flashcards/FlashcardsPage";
import ScramblePage from "@/pages/games/scramble/ScramblePage";
import FillBlankPage from "@/pages/games/fill-blank/FillBlankPage";
import ListeningPage from "@/pages/games/listening/ListeningPage";
import SpeedRoundPage from "@/pages/games/speed-round/SpeedRoundPage";
import WordMatchPage from "@/pages/games/word-match/WordMatchPage";
import TypeWordPage from "@/pages/games/type-word/TypeWordPage";
import SentenceBuilderPage from "@/pages/games/sentence-builder/SentenceBuilderPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { RequirePlacement } from "@/components/RequirePlacement";
import { AchievementToast } from "@/components/AchievementToast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PlacementProvider } from "@/hooks/usePlacement";
import { ThemeProvider } from "@/hooks/useTheme";

export default function App() {
  return (
    <BrowserRouter basename="/learn-english-app">
      <ThemeProvider>
      <PlacementProvider>
      <AchievementToast />
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/materials" element={<MaterialsPage />} />
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
        <Route
          path="/games/word-match"
          element={
            <RequirePlacement>
              <WordMatchPage />
            </RequirePlacement>
          }
        />
        <Route
          path="/games/type-word"
          element={
            <RequirePlacement>
              <TypeWordPage />
            </RequirePlacement>
          }
        />
        <Route
          path="/games/sentence-builder"
          element={
            <RequirePlacement>
              <SentenceBuilderPage />
            </RequirePlacement>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </ErrorBoundary>
      </PlacementProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

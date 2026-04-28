import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Eager — kept in the initial chunk:
//   - Layout primitives (Layout, ProtectedRoute, Error) and the homepage
//     itself need to be in the first paint.
//   - Auth pages (Login/Register/ForgotPassword/ResetPassword/ActivateAccount)
//     are entry points users hit before any code-split kicks in.
//   - Public-browse pages (PublicQuiz, UsersList, UserProfile) are reachable
//     from the homepage and don't benefit from a load-on-demand split.
import { Home } from "../components/Main/Home";
import Error from "../layout/Error";
import Loading from "../layout/Loading";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import PublicQuiz from "../components/Main/PublicQuiz";
import Register from "@/components/Auth/Register";
import Login from "@/components/Auth/Login";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import ResetPassword from "@/components/Auth/ResetPassword";
import ActivateAccount from "@/components/Auth/ActivateAccount";
import UsersList from "../components/Users/UsersList";
import UserProfile from "../components/Users/UserProfile";
import UsersLayout from "../layout/UsersLayout";
import DashboardLayout from "../layout/DashboardLayout";

// Lazy — only loaded when the route is hit. These are all behind
// ProtectedRoute and represent the "deep" dashboard surface.
const Quiz = lazy(() => import("../components/Quiz"));
const Library = lazy(() => import("../components/Library"));
const Score = lazy(() => import("../components/Score"));
const QuizQuestions = lazy(() => import("../components/QuizQuestions"));
const ShowScore = lazy(() => import("../components/ShowScore"));
const ShowMyScore = lazy(() => import("../components/ShowMyScore"));
const AddLibrary = lazy(() => import("../components/AddLibrary"));
const ProfilePage = lazy(() => import("@/components/Modals/Users/ProfilePage"));

// Centered fallback so the spinner is visible during route transitions.
// `min-h-screen` covers the case where the chunk loads before any layout
// content has rendered yet.
const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Loading />
  </div>
);

function Index() {
  return (
    <div className="relative">
      <div className="relative z-10">
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<Home />} />
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
                <Route path="forgotpassword" element={<ForgotPassword />} />
                <Route path="resetpassword/:token" element={<ResetPassword />} />
                <Route path="activate/:token" element={<ActivateAccount />} />
                {/* Updated Public Quiz Route with nested route for quiz details */}
                <Route path="public">
                  <Route index element={<PublicQuiz />} />
                  <Route path="quiz/:quizId" element={<PublicQuiz />} />
                </Route>
                {/* Public Users browse routes */}
                <Route path="users" element={<UsersLayout />}>
                  <Route index element={<UsersList />} />
                  <Route path=":userId" element={<UserProfile />} />
                </Route>
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  {/* The user's own editable profile — requires being logged in */}
                  <Route path="profile" element={<ProfilePage />} />
                  {/* Timed test page — flat sibling, no decorative grid behind */}
                  <Route
                    path="dashboard/library/:quiz"
                    element={<QuizQuestions />}
                  />
                  {/* All other /dashboard routes share the grid-background layout */}
                  <Route path="dashboard" element={<DashboardLayout />}>
                    <Route
                      path="add-quiz-to-library/:id"
                      element={<AddLibrary />}
                    />
                    <Route
                      path="add-quiz-via-token/:token"
                      element={<AddLibrary />}
                    />
                    <Route path="quizzes" element={<Quiz />} />
                    <Route path="scores" element={<Score />} />
                    <Route path="examiner-score/:id" element={<ShowScore />} />
                    <Route path="myscores/:id" element={<ShowMyScore />} />
                    <Route path="library" element={<Library />} />
                  </Route>
                </Route>

                {/* Catch-all Route */}
                <Route path="*" element={<Error />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default Index;

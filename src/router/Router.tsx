import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "../components/Main/Home";
import Error from "../layout/Error";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import Score from "../components/Score";
import QuizQuestions from "../components/QuizQuestions";
import Quiz from "../components/Quiz";
import Library from "../components/Library";
import ShowScore from "../components/ShowScore";
import PublicQuiz from "../components/Main/PublicQuiz";
import AddLibrary from "../components/AddLibrary";
import ShowMyScore from "../components/ShowMyScore";
import Register from "@/components/Auth/Register";
import Login from "@/components/Auth/Login";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import ResetPassword from "@/components/Auth/ResetPassword";
import ActivateAccount from "@/components/Auth/ActivateAccount";
import UsersList from "../components/Users/UsersList";
import UserProfile from "../components/Users/UserProfile";
import ProfilePage from "@/components/Modals/Users/ProfilePage";

function Index() {
  return (
    <div className="relative">
      <div className="relative z-10">
        <BrowserRouter>
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
              <Route path="users">
                <Route index element={<UsersList />} />
                <Route path=":userId" element={<UserProfile />} />
              </Route>
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                {/* The user's own editable profile — requires being logged in */}
                <Route path="profile" element={<ProfilePage />} />
                {/* Restored Quiz and Score routes */}
                <Route
                  path="dashboard/add-quiz-to-library/:id"
                  element={<AddLibrary />}
                />
                <Route
                  path="dashboard/add-quiz-via-token/:token"
                  element={<AddLibrary />}
                />
                <Route path="dashboard/quizzes" element={<Quiz />} />
                <Route path="dashboard/scores" element={<Score />} />
                {/* Updated ShowScore route for better clarity */}
                <Route
                  path="dashboard/examiner-score/:id"
                  element={<ShowScore />}
                />
                <Route
                  path="dashboard/myscores/:id"
                  element={<ShowMyScore />}
                />
                <Route path="dashboard/library" element={<Library />} />
                <Route
                  path="dashboard/library/:quiz"
                  element={<QuizQuestions />}
                />
              </Route>

              {/* Catch-all Route */}
              <Route path="*" element={<Error />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default Index;
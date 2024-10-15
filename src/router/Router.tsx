import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "../components/Main/Home";
import Login from "../auth/Login";
import ForgotPassword from "../auth/ForgotPassword";
import Error from "../layout/Error";
import ResetPassword from "../auth/ResetPassword";
import ActivateAccount from "../auth/ActivateAccount";
import Register from "../auth/Register";
import RoleProtectedRoute from "./RoleProtectedRoute";
import Layout from "./Layout";
import Score from "../components/Score";
import { useSelector } from "react-redux";
import { RootState } from "../reducer/store/store";
import ProfileModal from "../components/Modals/Users/ProfileModal";
import Unauthorized from "../layout/Unauthorized";
import QuizQuestions from "../components/QuizQuestions";
import Quiz from "../components/Quiz";
import Library from "../components/Library";
import ShowScore from "../components/ShowScore";
import PublicQuiz from "../components/Main/PublicQuiz";
import AddLibrary from "../components/AddLibrary";
import ShowMyScore from "../components/ShowMyScore";

function Index() {
  const { userData } = useSelector((state: RootState) => state.users);

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
              {/* Profile Route */}
              <Route
                path="profile"
                element={
                  <ProfileModal
                    isOpen={true}
                    onClose={() => window.history.back()}
                    userData={userData}
                  />
                }
              />
              {/* Role-based Protected Routes */}
              <Route element={<RoleProtectedRoute allowedRoles={["User"]} />}>
                {/* Restored Quiz and Score routes */}
                <Route
                  path="dashboard/add-quiz-to-library/:id"
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

              {/* Unauthorized Route */}
              <Route path="/unauthorized" element={<Unauthorized />} />

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

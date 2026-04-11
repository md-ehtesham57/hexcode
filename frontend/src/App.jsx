import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import HomePage from "./page/HomePage";
import LoginPage from "./page/LoginPage";
import SignUpPage from "./page/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { Loader } from "lucide-react";
import Layout from "./layout/Layout";
import AdminRoute from "./components/AdminRoute";
import AddProblem from "./page/AddProblem";
import ProblemPage from "./page/ProblemPage";
import OAuthSuccess from "./page/oauth-success";
import Dashboard from "./page/Dashboard";

const App = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    checkAuth();
  }, []);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start ">
      <Toaster />
      <Routes>

        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />

        <Route element={<Layout />}>

          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />

          <Route
            path="/problem/:id"
            element={authUser ? <ProblemPage /> : <Navigate to="/login" />}
          />

          <Route element={<AdminRoute />}>
            <Route path="/add-problem" element={<AddProblem />} />
          </Route>

          <Route path="/dashboard" element={authUser ? <Dashboard /> : <Navigate to="/login" />} />

        </Route>
        <Route path="/oauth-success" element={<OAuthSuccess />} />

      </Routes>
    </div>
  );
};

export default App;
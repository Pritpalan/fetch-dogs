import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Search from "./pages/Search";
import { Toaster } from "react-hot-toast";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const status = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(status);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/fetch-dogs" element={<Login />} />
          <Route
            path="/search"
            element={isLoggedIn ? <Search /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;

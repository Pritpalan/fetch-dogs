import React, { useState } from "react";
import fetchClient from "../API/fetchClient";
import { toast } from "react-hot-toast";

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!name.trim() || !email.trim()) {
        setError("Both fields are required.");
        setLoading(false);
        return;
      }

      await fetchClient.post("/auth/login", { name, email });
      await fetchClient.get("/dogs/breeds");

      localStorage.setItem("isLoggedIn", "true");
      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "/search";
      }, 800);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your name and email.");
      localStorage.removeItem("isLoggedIn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm space-y-6"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700">
          Welcome
        </h1>
        <p className="text-sm text-gray-500 text-center">
          Please log in to continue
        </p>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default Login;

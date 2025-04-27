import React, { useEffect, useState } from "react";
import fetchClient from "../API/fetchClient";
import Select from "react-select";
import { toast } from "react-hot-toast";

const Search = () => {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem("favorites");
    return stored ? JSON.parse(stored) : [];
  });
  const [matchedDog, setMatchedDog] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("asc");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const resultsPerPage = 12;

  const getFilteredDogs = () => {
    return showOnlyFavorites
      ? dogs.filter((dog) => favorites.includes(dog.id))
      : dogs;
  };

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const res = await fetchClient.get("/dogs/breeds");
        setBreeds(res.data);
      } catch (err) {
        console.error("Error fetching breeds:", err);
      }
    };
    fetchBreeds();
  }, []);

  const fetchDogs = async (url = "/dogs/search") => {
    try {
      let res;
      if (url === "/dogs/search") {
        res = await fetchClient.get(url, {
          params: {
            breeds: selectedBreeds.length > 0 ? selectedBreeds : [],
            sort: `breed:${sortOrder}`,
            size: resultsPerPage,
          },
        });
        setCurrentPage(1);
      } else {
        res = await fetchClient.get(url);
        const match = url.match(/from=(\d+)/);
        const offset = match ? parseInt(match[1], 10) : 0;
        setCurrentPage(Math.floor(offset / resultsPerPage) + 1);
      }

      setTotalResults(res.data.total);

      const dogDetails = await fetchClient.post("/dogs", res.data.resultIds);
      setDogs(dogDetails.data);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to fetch dogs:", err);
    }
  };

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const res = await fetchClient.get("/dogs/search", {
          params: {
            breeds: selectedBreeds.length > 0 ? selectedBreeds : [],
            sort: `breed:${sortOrder}`,
            size: resultsPerPage,
          },
        });
        setCurrentPage(1);
        setTotalResults(res.data.total);

        const dogDetails = await fetchClient.post("/dogs", res.data.resultIds);
        setDogs(dogDetails.data);

        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Failed to fetch dogs:", err);
      }
    };

    fetchDogs();
  }, [selectedBreeds, sortOrder]);

  const toggleFavorite = (dogId) => {
    setFavorites((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId]
    );
  };

  const handleMatch = () => {
    if (favorites.length === 0) return;
    setLoadingMatch(true);

    setTimeout(() => {
      const matchId = favorites[favorites.length - 1];
      const matched = dogs.find((dog) => dog.id === matchId);

      if (matched) {
        setMatchedDog(matched);
      } else {
        setMatchedDog({
          id: matchId,
          name: "Mystery Pup",
          age: "?",
          breed: "Unknown",
          zip_code: "Hidden",
          img: "https://place-puppy.com/300x300",
        });
      }
      setLoadingMatch(false);
    }, 1200);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetchClient.post("/auth/logout");
      localStorage.removeItem("isLoggedIn");
      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err) {
      console.error("Logout failed", err);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
      <div className="w-full max-w-7xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">
            🐾 Fetch A Friend
          </h1>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </header>

        <h2 className="text-2xl font-bold mb-6 text-center">Browse Dogs</h2>

        <div className="flex flex-wrap justify-center gap-4 items-end mb-8">
          <div className="flex flex-col text-center">
            <label className="font-semibold text-gray-600 mb-1">Breed</label>
            <Select
              isMulti
              options={breeds.map((breed) => ({ value: breed, label: breed }))}
              value={selectedBreeds.map((b) => ({ value: b, label: b }))}
              onChange={(options) =>
                setSelectedBreeds(options.map((opt) => opt.value))
              }
              className="w-60 text-left"
              placeholder="Select Breeds..."
            />
          </div>

          <div className="flex flex-col text-center">
            <label className="font-semibold text-gray-600 mb-1">
              Sort by Breed
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            >
              <option value="asc">A → Z</option>
              <option value="desc">Z → A</option>
            </select>
          </div>

          <div className="flex flex-col">
            <button
              onClick={() => setShowOnlyFavorites((prev) => !prev)}
              className={`px-4 py-2 rounded-md ${
                showOnlyFavorites
                  ? "bg-red-500 text-white"
                  : "bg-gray-300 text-black"
              } hover:bg-red-400`}
            >
              {showOnlyFavorites
                ? "Showing Favorites ❤️"
                : "Show Favorites Only"}
            </button>
          </div>

          <div className="flex flex-col">
            <button
              onClick={() => {
                setSelectedBreeds([]);
                setSortOrder("asc");
                setShowOnlyFavorites(false);
              }}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-300 text-black"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {getFilteredDogs().map((dog) => (
            <div
              key={dog.id}
              className={`bg-white rounded-lg shadow-md flex flex-col items-center p-4 ${
                favorites.includes(dog.id) ? "border-2 border-red-500" : ""
              }`}
            >
              <div className="w-60 h-60 overflow-hidden flex items-center justify-center">
                <img
                  src={dog.img}
                  alt={dog.name}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-lg font-bold mt-2">{dog.name}</h3>
              <p>Breed: {dog.breed}</p>
              <p>Age: {dog.age}</p>
              <p>Zip Code: {dog.zip_code}</p>
              <button
                onClick={() => toggleFavorite(dog.id)}
                className={`mt-3 px-4 py-2 rounded ${
                  favorites.includes(dog.id)
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {favorites.includes(dog.id)
                  ? "Favorited ❤️"
                  : "Add to Favorites"}
              </button>
            </div>
          ))}
        </div>

        {!showOnlyFavorites && totalResults > 0 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                fetchDogs(
                  `/dogs/search?from=${(currentPage - 2) * resultsPerPage}`
                )
              }
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
            >
              &lt; Previous
            </button>

            {Array.from(
              { length: Math.min(5, Math.ceil(totalResults / resultsPerPage)) },
              (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() =>
                    fetchDogs(`/dogs/search?from=${idx * resultsPerPage}`)
                  }
                  className={`px-3 py-1 border rounded ${
                    currentPage === idx + 1
                      ? "bg-black text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {idx + 1}
                </button>
              )
            )}

            {Math.ceil(totalResults / resultsPerPage) > 5 && (
              <>
                <span className="px-2">...</span>
                <button
                  onClick={() =>
                    fetchDogs(
                      `/dogs/search?from=${
                        (Math.ceil(totalResults / resultsPerPage) - 1) *
                        resultsPerPage
                      }`
                    )
                  }
                  className="px-3 py-1 border rounded hover:bg-gray-100"
                >
                  {Math.ceil(totalResults / resultsPerPage)}
                </button>
              </>
            )}

            <button
              disabled={
                currentPage === Math.ceil(totalResults / resultsPerPage)
              }
              onClick={() =>
                fetchDogs(`/dogs/search?from=${currentPage * resultsPerPage}`)
              }
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200"
            >
              Next &gt;
            </button>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleMatch}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            >
              Find My Match ❤️
            </button>
          </div>
        )}

        {loadingMatch && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200"></div>
            <span className="text-blue-600 font-semibold">
              Finding your match...
            </span>
          </div>
        )}

        {matchedDog && (
          <div className="mt-8 p-6 border rounded-lg bg-white shadow max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Your Match
            </h2>
            <img
              src={matchedDog.img}
              alt={matchedDog.name}
              className="w-full h-64 object-cover rounded mb-4"
            />
            <h3 className="text-xl font-semibold">{matchedDog.name}</h3>
            <p>Breed: {matchedDog.breed}</p>
            <p>Age: {matchedDog.age}</p>
            <p>Zip Code: {matchedDog.zip_code}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;

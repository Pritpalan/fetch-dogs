import React, { useEffect, useState } from 'react';
import fetchClient from '../API/fetchClient';
import Select from 'react-select';
import { toast } from 'react-hot-toast';

const Search = () => {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [matchedDog, setMatchedDog] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [allDogs, setAllDogs] = useState({});


  const resultsPerPage = 12;

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const getFilteredDogs = () => {
    if (showOnlyFavorites) {
      return favorites
        .map((favId) => allDogs[favId])
        .filter(Boolean); // in case some dog data is missing
    }
    return dogs;
  };

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const res = await fetchClient.get('/dogs/breeds');
        setBreeds(res.data);
      } catch (err) {
        toast.error('Error fetching breeds:', err);
      }
    };
    fetchBreeds();
  }, []);

  const fetchDogs = async (offset = 0) => {
    try {
      const res = await fetchClient.get('/dogs/search', {
        params: {
          breeds: selectedBreeds.length > 0 ? selectedBreeds : [],
          sort: `breed:${sortOrder}`,
          size: resultsPerPage,
          from: offset,
        },
      });
      setCurrentPage(Math.floor(offset / resultsPerPage) + 1);
      setTotalResults(res.data.total);

      const dogDetails = await fetchClient.post('/dogs', res.data.resultIds);
      setDogs(dogDetails.data);
      setAllDogs((prev) => {
        const updated = { ...prev };
        dogDetails.data.forEach((dog) => {
          updated[dog.id] = dog;
        });
        return updated;
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error('Failed to fetch dogs:', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    fetchDogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBreeds, sortOrder]);

  const toggleFavorite = (dogId) => {
    setFavorites((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId]
    );
  
    if (matchedDog && matchedDog.id === dogId) {
      setMatchedDog(null);
    }
  };
  

  const handleMatch = () => {
    if (favorites.length === 0) {
      toast.error('Add dogs to favorites first to find a match!');
      return;
    }
    const availableFavorites = favorites.filter((id) => allDogs[id]);
    if (availableFavorites.length === 0) {
      toast.error('No data available for selected favorites.');
      return;
    }
    setLoadingMatch(true);

    setTimeout(() => {
      const lastFavId = availableFavorites[availableFavorites.length - 1];
      setMatchedDog(allDogs[lastFavId]);
      setLoadingMatch(false);
    }, 1200);
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetchClient.post('/auth/logout');
      localStorage.removeItem('isLoggedIn');
      toast.success('Logged out successfully');
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err) {
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }
    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4 flex justify-center'>
      <div className='w-full max-w-7xl'>
        <header className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-blue-700'>🐾 Fetch A Friend</h1>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50'
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </header>

        <h2 className='text-2xl font-bold mb-6 text-center'>Browse Dogs</h2>

        {/* Filters */}
        <div className='flex flex-wrap justify-center gap-4 items-end mb-8'>
          <div className='flex flex-col text-center'>
            <label className='font-semibold text-gray-600 mb-1'>Breed</label>
            <Select
              isMulti
              options={breeds.map((breed) => ({ value: breed, label: breed }))}
              value={selectedBreeds.map((b) => ({ value: b, label: b }))}
              onChange={(options) =>
                setSelectedBreeds(options.map((opt) => opt.value))
              }
              className='w-60 text-left'
              placeholder='Select Breeds...'
            />
          </div>

          <div className='flex flex-col text-center'>
            <label className='font-semibold text-gray-600 mb-1'>
              Sort by Breed
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className='p-2 border rounded-md focus:ring-2 focus:ring-blue-400'
            >
              <option value='asc'>A → Z</option>
              <option value='desc'>Z → A</option>
            </select>
          </div>

          <div className='flex flex-col'>
            <button
              onClick={() => setShowOnlyFavorites((prev) => !prev)}
              className={`px-4 py-2 rounded-md ${
                showOnlyFavorites
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-300 text-black'
              } hover:bg-red-400`}
            >
              {showOnlyFavorites
                ? 'Showing Favorites ❤️'
                : 'Show Favorites Only'}
            </button>
          </div>

          <div className='flex flex-col'>
            <button
              onClick={() => {
                setSelectedBreeds([]);
                setSortOrder('asc');
                setShowOnlyFavorites(false);
              }}
              className='px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-300 text-black'
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Dogs */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {getFilteredDogs().map((dog) => (
            <div
              key={dog.id}
              className={`bg-white rounded-lg shadow-md flex flex-col items-center p-4 ${
                favorites.includes(dog.id) ? 'border-2 border-red-500' : ''
              }`}
            >
              <div className='w-60 h-60 overflow-hidden flex items-center justify-center'>
                <img
                  src={dog.img}
                  alt={dog.name}
                  className='w-full h-full object-cover transform hover:scale-105 transition-transform duration-300'
                />
              </div>
              <h3 className='text-lg font-bold mt-2'>{dog.name}</h3>
              <p>Breed: {dog.breed}</p>
              <p>Age: {dog.age}</p>
              <p>Zip Code: {dog.zip_code}</p>
              <button
                onClick={() => toggleFavorite(dog.id)}
                className={`mt-3 px-4 py-2 rounded ${
                  favorites.includes(dog.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-300 text-black'
                }`}
              >
                {favorites.includes(dog.id)
                  ? 'Saved ❤️'
                  : 'Add to Favorites'}
              </button>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!showOnlyFavorites && totalPages > 1 && (
          <div className='flex flex-col items-center mt-8 space-y-2'>
            <div className='flex space-x-2'>
              <button
                disabled={currentPage === 1}
                onClick={() => fetchDogs((currentPage - 2) * resultsPerPage)}
                className='px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200'
              >
                &lt; Previous
              </button>

              {getVisiblePages().map((page) => (
                <button
                  key={page}
                  onClick={() => fetchDogs((page - 1) * resultsPerPage)}
                  className={`px-3 py-1 border rounded ${
                    page === currentPage
                      ? 'bg-black text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchDogs(currentPage * resultsPerPage)}
                className='px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-200'
              >
                Next &gt;
              </button>
            </div>

            <div className='text-gray-600 text-sm mt-2'>
              Page <span className='font-bold'>{currentPage}</span> of{' '}
              <span className='font-bold'>{totalPages}</span>
            </div>
          </div>
        )}

        {/* Match Button */}
        {favorites.length > 0 && (
          <div className='mt-8 flex justify-center'>
            <button
              onClick={handleMatch}
              className='bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600'
            >
              Find My Match ❤️
            </button>
          </div>
        )}

        {/* Match Loading */}
        {loadingMatch && (
          <div className='mt-8 flex justify-center items-center gap-2'>
            <div className='animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-gray-200'></div>
            <span className='text-blue-600 font-semibold'>
              Finding your match...
            </span>
          </div>
        )}

        {/* Match Result */}
        {matchedDog && (
          <div className='mt-8 p-6 border rounded-lg bg-white shadow max-w-md mx-auto text-center'>
            <h2 className='text-2xl font-bold mb-4 text-green-600'>Your Match</h2>
            <img
              src={matchedDog.img}
              alt={matchedDog.name}
              className='w-full h-64 object-cover rounded mb-4'
            />
            <h3 className='text-xl font-semibold'>{matchedDog.name}</h3>
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

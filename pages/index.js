// pages/index.js
import { useEffect, useState } from "react";
import Head from "next/head";
import PlantCard from "../components/PlantCard";
import AddPlantModal from "../components/AddPlantModal";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Date Added");
  const [sortDirection, setSortDirection] = useState("desc");

  const { isAuthenticated, browseOnly, logout } = useAuth();
  const canEdit = isAuthenticated && !browseOnly;
  const FILTERS = ["All", "Annual", "Perennial", "Produce"];

  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await fetch("/api/plants");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected data format");
        setPlants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlants();
  }, []);

  function handlePlantAdded(newPlant) {
    setPlants((prev) => [...prev, newPlant]);
  }

  function handlePlantUpdated(updatedPlant) {
    setPlants((prev) =>
      prev.map((p) =>
        p.id === updatedPlant.id ? { ...p, fields: updatedPlant.fields } : p
      )
    );
  }

  const filteredPlants =
    selectedFilter === "All"
      ? plants
      : plants.filter(
          (plant) =>
            plant.fields.Type?.toLowerCase() === selectedFilter.toLowerCase()
        );

  const sortedPlants = [...filteredPlants].sort((a, b) => {
    const fieldMap = {
      "Date Added": "createdTime",
      "Date Planted": "Year planted",
      "Expected Bloom": "Expected bloom",
    };
    const field = fieldMap[sortBy];

    const aVal = field === "createdTime" ? a.createdTime : a.fields?.[field];
    const bVal = field === "createdTime" ? b.createdTime : b.fields?.[field];

    if (!aVal) return 1;
    if (!bVal) return -1;

    if (field === "Year planted") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortDirection === "asc"
      ? aVal.toString().localeCompare(bVal.toString())
      : bVal.toString().localeCompare(aVal.toString());
  });

  const sortByLabel = (by, dir) => {
    const map = {
      "Date Added": dir === "asc" ? "Date Added (Oldest)" : "Date Added (Newest)",
      "Date Planted": dir === "asc" ? "Date Planted (Oldest)" : "Date Planted (Newest)",
      "Expected Bloom": dir === "asc" ? "Expected Bloom (Earliest)" : "Expected Bloom (Latest)",
    };
    return map[by];
  };

  const getNextSortOption = (by, dir) => {
    const options = [
      { sortBy: "Date Added", sortDirection: "desc" },
      { sortBy: "Date Added", sortDirection: "asc" },
      { sortBy: "Date Planted", sortDirection: "desc" },
      { sortBy: "Date Planted", sortDirection: "asc" },
      { sortBy: "Expected Bloom", sortDirection: "asc" },
      { sortBy: "Expected Bloom", sortDirection: "desc" },
    ];
    const currentIndex = options.findIndex(
      (opt) => opt.sortBy === by && opt.sortDirection === dir
    );
    return options[(currentIndex + 1) % options.length];
  };

  if (loading) return <p className="text-center text-gray-500">Loading plants...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <>
      <Head>
        <title>Plants de Louton</title>
        <meta name="description" content="Your interactive garden tracker – explore, add, and edit your plants with ease." />
        <meta property="og:title" content="Plants de Louton" />
        <meta property="og:description" content="Your interactive garden tracker – explore, add, and edit your plants with ease." />
        {/* <meta property="og:image" content="https://louton-plant-guide.vercel.app/og-preview.jpg" />
        <meta property="og:url" content="https://louton-plant-guide.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Plants de Louton" />
        <meta name="twitter:description" content="Your interactive garden tracker – explore, add, and edit your plants with ease." />
        <meta name="twitter:image" content="https://louton-plant-guide.vercel.app/og-preview.jpg" /> */}
      </Head>

      {!isAuthenticated && !browseOnly && <AuthModal />}

      <div className={`min-h-screen ${!isAuthenticated && !browseOnly ? "blur-sm pointer-events-none" : ""}`}>
        {(isAuthenticated || browseOnly) && (
          <div className="absolute top-4 right-4">
            <button
              onClick={logout}
              className="text-sm text-gray-300 bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition"
            >
              Sign Out
            </button>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-white">Plants de Louton</h1>

          <div className="flex justify-center gap-3 mt-4 mb-6 flex-wrap">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 text-sm rounded-full border transition ${
                  selectedFilter === filter
                    ? "bg-white text-gray-900 font-semibold"
                    : "bg-transparent text-white border-white"
                }`}
              >
                {filter}
              </button>
            ))}

            <button
              onClick={() => {
                const next = getNextSortOption(sortBy, sortDirection);
                setSortBy(next.sortBy);
                setSortDirection(next.sortDirection);
              }}
              className="px-3 py-1 text-sm rounded-full border transition bg-white text-gray-900 font-semibold"
            >
              {sortByLabel(sortBy, sortDirection)}
            </button>
          </div>

          <div className="flex justify-center">
            <div className="flex flex-wrap justify-center gap-8">
              {sortedPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  setPlants={setPlants}
                  canEdit={canEdit}
                  onUpdate={handlePlantUpdated}
                />
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (canEdit) setShowModal(true);
          }}
          aria-label="Add a new plant"
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full text-white text-2xl font-bold shadow-xl flex items-center justify-center transition ${
            canEdit
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-500 cursor-not-allowed"
          }`}
          disabled={!canEdit}
        >
          +
        </button>

        {showModal && (
          <AddPlantModal onClose={() => setShowModal(false)} onPlantAdded={handlePlantAdded} />
        )}
      </div>
    </>
  );
}
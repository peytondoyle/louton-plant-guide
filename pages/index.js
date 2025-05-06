// pages/index.js
import { useEffect, useState } from "react";
import PlantCard from "../components/PlantCard";
import AddPlantModal from "../components/AddPlantModal";

export default function Home() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");

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
    setPlants((prevPlants) => [...prevPlants, newPlant]);
  }

  const filteredPlants =
    selectedFilter === "All"
      ? plants
      : plants.filter(
          (plant) =>
            plant.fields.Type?.toLowerCase() === selectedFilter.toLowerCase()
        );

  if (loading) return <p className="text-center text-gray-500">Loading plants...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-center text-white">Plants de Louton</h1>

        {/* 🔍 Filter Buttons */}
        <div className="flex justify-center gap-3 mt-4 mb-8">
          {["All", "Perennial", "Annual"].map((filter) => (
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
        </div>

        {/* ✅ CENTERED GRID WRAPPER */}
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-8">
            {filteredPlants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} setPlants={setPlants} />
            ))}
          </div>
        </div>
      </div>

      {/* ➕ Floating Add Button */}
      <button
        onClick={() => setShowModal(true)}
        aria-label="Add a new plant"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white text-2xl font-bold shadow-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center"
      >
        +
      </button>

      {/* 🌱 Add Plant Modal */}
      {showModal && (
        <AddPlantModal onClose={() => setShowModal(false)} onPlantAdded={handlePlantAdded} />
      )}
    </div>
  );
}
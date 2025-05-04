// pages/index.js
import { useEffect, useState } from "react";
import PlantCard from "../components/PlantCard";
import AddPlantModal from "../components/AddPlantModal";

export default function Home() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  if (loading) return <p className="text-center text-gray-500">Loading plants...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">My Plants</h1>

        {/* ✅ CENTERED GRID WRAPPER */}
        <div className="flex justify-center">
          <div className="flex flex-wrap justify-center gap-8">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} setPlants={setPlants} />
            ))}
          </div>
        </div>
      </div>

      {/* ➕ Floating Add Button */}
      <button
        className="fixed bottom-6 right-6 bg-gray-500 bg-opacity-50 hover:bg-opacity-100 text-white text-3xl rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
        onClick={() => setShowModal(true)}
        aria-label="Add a new plant"
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
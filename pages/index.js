import { useEffect, useState } from 'react';
import PlantCard from '../components/PlantCard';

export function PlantList({ plants, setPlants }) { // Pass setPlants
  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPlants() {
      try {
        const res = await fetch('/api/plants');
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        
        if (!Array.isArray(data)) throw new Error('Data is not an array');
        
        setPlants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlants();
  }, []);

  if (loading) return <p>Loading plants...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">My Plants</h1>
        
        <PlantList plants={plants} setPlants={setPlants} /> {/* Pass setPlants */}
      </main>
    </div>
  );
}
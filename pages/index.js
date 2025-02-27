import { useEffect, useState } from 'react';

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
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Plants</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.id} className="bg-white p-4 rounded shadow">
              {plant.fields?.Image && (
                <img
                  src={plant.fields.Image}
                  alt={plant.fields['Plant name']}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <h2 className="text-xl font-semibold mt-2">
                {plant.fields['Plant name']}
              </h2>
              {plant.fields?.Description && (
                <p className="text-gray-600 mt-1">
                  {plant.fields.Description}
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
import { useEffect, useState } from 'react';

export default function Home() {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    async function fetchPlants() {
      const res = await fetch('/api/plants');
      const data = await res.json();
      setPlants(data);
    }
    fetchPlants();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Plants</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {plants.map((plant) => (
            <div key={plant.id} className="bg-white p-4 rounded shadow">
              {plant.fields.Image && (
                <img
                  src={plant.fields.Image}
                  alt={plant.fields['Plant name']}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <h2 className="text-xl font-semibold mt-2">
                {plant.fields['Plant name']}
              </h2>
              {plant.fields.Description && (
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
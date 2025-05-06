import { useState } from "react";
import Image from "next/image";

export default function AddPlantModal({ onClose, onPlantAdded }) {
  const [plantName, setPlantName] = useState("");
  const [detailedName, setDetailedName] = useState("");
  const [yardLocation, setYardLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageOptions, setImageOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [step, setStep] = useState(1);
  const [yearPlanted, setYearPlanted] = useState("");

  const fetchPlantImages = async () => {
    if (!plantName.trim()) return;

    try {
      const query = [plantName, detailedName].filter(Boolean).join(" ");
      const response = await fetch(`/api/fetchPlantImages?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error || !data.images.length) {
        alert("No images found. Try another name.");
        return;
      }

      setImageOptions(data.images || []);
      setStep(2);
    } catch (error) {
      console.error("Error fetching images:", error);
      alert("Failed to fetch images.");
    }
  };

  const handleSubmit = async () => {
    if (!plantName.trim()) {
      alert("Plant Name is required!");
      return;
    }

    setLoading(true);

    try {
      if (step === 1) {
        await fetchPlantImages();
        return;
      }

      if (!selectedImage) {
        alert("Please select an image.");
        return;
      }

      const addResponse = await fetch("/api/addPlant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantName,
          detailedName,
          yardLocation,
          image: selectedImage,
          yearPlanted,
        }),
      });

      const addResult = await addResponse.json();
      if (!addResponse.ok) throw new Error(addResult.error || "Failed to add plant");

      const recordId = addResult.plant?.id;

      // Trigger fill in details if plant was added
      if (recordId) {
        const fillResponse = await fetch("/api/fillPlantData", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plantName,
            detailedName,
            recordId,
          }),
        });

        const fillResult = await fillResponse.json();
        if (!fillResult.success) {
          console.warn("⚠️ Auto-fill failed:", fillResult.error);
        }
      }

      alert("Plant added successfully!");
      onPlantAdded(addResult.plant);
      onClose();
      window.location.reload(); // Optional: force refresh
    } catch (error) {
      console.error("Failed to add plant:", error);
      alert("Failed to add plant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-70 z-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-900">Add a New Plant</h2>
  
        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="Plant Name"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="text"
              placeholder="Detailed Name"
              value={detailedName}
              onChange={(e) => setDetailedName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="text"
              placeholder="Yard Location"
              value={yardLocation}
              onChange={(e) => setYardLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="number"
              placeholder="Year Planted"
              value={yearPlanted}
              onChange={(e) => setYearPlanted(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
  
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition"
            >
              {loading ? "Loading..." : "Next"}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">Select an Image</h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {imageOptions.map((img, index) => (
                <div key={index} className="relative w-full aspect-square">
                  <img
                    src={img}
                    alt="Plant option"
                    className={`w-full h-full object-cover rounded cursor-pointer ${
                      selectedImage === img ? "ring-4 ring-green-500" : "ring-1 ring-gray-300"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  />
                </div>
              ))}
            </div>
  
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedImage}
              className="w-full bg-green-600 text-white py-2 rounded-lg text-sm mt-4 hover:bg-green-700 transition"
            >
              {loading ? "Saving..." : "Save Plant"}
            </button>
          </>
        )}
  
        <button
          onClick={onClose}
          className="w-full mt-3 text-sm text-gray-500 hover:underline text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
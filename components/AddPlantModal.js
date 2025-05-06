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

  const fetchPlantImages = async () => {
    if (!plantName.trim()) return;

    try {
      const response = await fetch(`/api/fetchPlantImages?query=${encodeURIComponent(plantName)}`);
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

      const response = await fetch("/api/addPlant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantName,
          detailedName,
          yardLocation,
          image: selectedImage,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to add plant");

      alert("Plant added successfully!");
      onPlantAdded(result.plant);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-center">Add a New Plant</h2>

        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="Plant Name"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full p-2 border rounded mb-2 text-sm"
            />
            <input
              type="text"
              placeholder="Detailed Name"
              value={detailedName}
              onChange={(e) => setDetailedName(e.target.value)}
              className="w-full p-2 border rounded mb-2 text-sm"
            />
            <input
              type="text"
              placeholder="Yard Location"
              value={yardLocation}
              onChange={(e) => setYardLocation(e.target.value)}
              className="w-full p-2 border rounded mb-2 text-sm"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 rounded text-sm hover:bg-blue-600 transition"
            >
              {loading ? "Loading..." : "Next"}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Select an Image</h3>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {imageOptions.map((img, index) => (
                <div key={index} className="relative w-full aspect-square">
                  <Image
                    src={img}
                    alt="Plant option"
                    layout="fill"
                    objectFit="cover"
                    className={`rounded cursor-pointer ${
                      selectedImage === img ? "ring-4 ring-blue-500" : "ring-1 ring-gray-300"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedImage}
              className="w-full bg-green-600 text-white py-2 rounded text-sm mt-4 hover:bg-green-700 transition"
            >
              {loading ? "Saving..." : "Save Plant"}
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full text-gray-500 text-sm mt-3 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
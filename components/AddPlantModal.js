import { useState } from "react";

export default function AddPlantModal({ onClose, onPlantAdded }) {
  const [plantName, setPlantName] = useState("");
  const [detailedName, setDetailedName] = useState("");
  const [yardLocation, setYardLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageOptions, setImageOptions] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [step, setStep] = useState(1);

  // 🌱 Fetch images from Google (or another API)
  async function fetchPlantImages() {
    if (!plantName.trim()) return; // Prevent unnecessary API calls

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
  }

  async function handleSubmit() {
    if (!plantName.trim()) {
      alert("Plant Name is required!");
      return;
    }
  
    setLoading(true);
  
    try {
      if (step === 1) {
        await fetchPlantImages();
        return; // ✅ loading state will be reset in finally
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
      onClose(); // Auto-close after successful submission
      window.location.reload(); // 🚀 Force a page reload after closing
    } catch (error) {
      console.error("Failed to add plant:", error);
      alert("Failed to add plant.");
    } finally {
      setLoading(false); // ✅ Always run, regardless of return or error
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add a New Plant</h2>

        {step === 1 ? (
          <>
            <input
              type="text"
              placeholder="Plant Name"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Detailed Name"
              value={detailedName}
              onChange={(e) => setDetailedName(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Yard Location"
              value={yardLocation}
              onChange={(e) => setYardLocation(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-500 text-white py-2 rounded mt-4"
              disabled={loading}
            >
              {loading ? "Loading..." : "Next"}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-sm text-gray-700 mb-2">Select an Image</h3>
            <div className="grid grid-cols-3 gap-2">
              {imageOptions.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="Plant option"
                  className={`cursor-pointer rounded ${
                    selectedImage === img ? "border-4 border-blue-500" : "border"
                  }`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 text-white py-2 rounded mt-4"
              disabled={loading || !selectedImage}
            >
              {loading ? "Saving..." : "Save Plant"}
            </button>
          </>
        )}

        <button onClick={onClose} className="w-full text-gray-500 text-sm mt-2">
          Cancel
        </button>
      </div>
    </div>
  );
}
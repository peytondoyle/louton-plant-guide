import { useState } from "react";
import EditPlantModal from "./EditPlantModal";
import Buttons from "./Buttons";

export default function PlantCard({ plant, setPlants }) {
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!plant || !plant.fields) return null;

  const formatSize = (value) => {
    if (!value || isNaN(value)) return "N/A";
    return value > 12 ? `${(value / 12).toFixed(1)} ft` : `${value} in`;
  };

  const truncateText = (text, limit = 25) => {
    if (!text) return "N/A";
    return text.length > limit && !showFullText
      ? text.substring(0, limit).trim() + "..."
      : text;
  };

  async function fetchMissingPlantData(e) {
    e.stopPropagation();
    setLoading(true);
    try {
      const res = await fetch("/api/fillPlantData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantName: plant.fields["Plant name"],
          detailedName: plant.fields["Detailed name"],
          recordId: plant.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPlants((prev) =>
          prev.map((p) =>
            p.id === plant.id
              ? { ...p, fields: { ...p.fields, ...data.airtableData.records[0].fields } }
              : p
          )
        );
        setFlipped(true);
      } else {
        alert("Failed to update plant.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Error fetching plant data.");
    }
    setLoading(false);
  }

  async function handleDeletePlant() {
    if (!confirm("Are you sure you want to delete this plant?")) return;

    try {
      const res = await fetch(`/api/deletePlant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: plant.id }),
      });

      const result = await res.json();

      if (result.success) {
        setPlants((prev) => prev.filter((p) => p.id !== plant.id));
      } else {
        alert("Failed to delete plant.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong while deleting.");
    }
  }

  const isMissingData =
    !plant.fields.Type || !plant.fields.Growth || !plant.fields["Width in inches"];

  return (
    <div
      className="relative w-64 h-80 cursor-pointer perspective"
      onClick={() => {
        if (!showEditModal) setFlipped(!flipped);
      }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT */}
        <div className="absolute w-full h-full bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
          {plant.fields?.Image ? (
            <img
              src={plant.fields.Image}
              alt={plant.fields["Plant name"]}
              className="w-full h-3/4 object-cover"
            />
          ) : (
            <div className="w-full h-3/4 flex items-center justify-center text-gray-400 italic text-sm">
              No Image
            </div>
          )}
          <div className="flex-grow flex flex-col items-center justify-center p-2">
            <h2 className="text-xl font-semibold text-center">{plant.fields["Plant name"]}</h2>
            {plant.fields["Detailed name"] && (
              <p className="text-sm italic text-gray-500">{plant.fields["Detailed name"]}</p>
            )}
          </div>
        </div>

        {/* BACK */}
        <div className="absolute w-full h-full bg-gray-50 shadow-md rounded-lg overflow-hidden flex flex-col transform rotate-y-180 backface-hidden">
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-base font-semibold text-center leading-snug">
              {plant.fields["Plant name"]}
            </h3>
            {plant.fields["Detailed name"] && (
              <p className="text-xs italic text-gray-500 text-center -mt-0.5">
                {plant.fields["Detailed name"]}
              </p>
            )}

            <p className="mt-3 text-sm">
              🌱 <span className="font-semibold">Type:</span> {plant.fields.Type || "N/A"}
            </p>

            <p className="text-sm">
              📈 <span className="font-semibold">Growth:</span> {plant.fields.Growth || "N/A"}
            </p>

            <p className="text-sm">
              🗓 <span className="font-semibold">Planted:</span> {plant.fields["Year planted"] || "N/A"}
            </p>

            <p className="font-semibold text-sm mt-3">📏 Size</p>
            <p className="text-sm">↔ Width: {formatSize(plant.fields["Width in inches"])}</p>
            <p className="text-sm">⬆ Height: {formatSize(plant.fields["Height in inches"])}</p>
            <p className="text-sm">🌿 Spacing: {formatSize(plant.fields["Space in inches"])}</p>

            {(plant.fields["Pruning"] || plant.fields["Pruning details"]) && (
              <div className="mt-3">
                <p className="font-semibold text-sm">✂️ Pruning</p>
                {plant.fields["Pruning"] && (
                  <p className="text-sm text-gray-800">{plant.fields["Pruning"]}</p>
                )}
                {plant.fields["Pruning details"] && (
                  <p className="text-sm text-gray-700 mt-1">
                    📝 {truncateText(plant.fields["Pruning details"])}
                    {plant.fields["Pruning details"].length > 25 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullText(!showFullText);
                        }}
                        className="text-blue-500 ml-1 text-xs underline"
                      >
                        {showFullText ? "Show less" : "Show more"}
                      </button>
                    )}
                  </p>
                )}
              </div>
            )}

            {isMissingData && (
              <button
                onClick={(e) => fetchMissingPlantData(e)}
                className="mt-3 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                disabled={loading}
              >
                {loading ? "Fetching..." : "Fill in Details"}
              </button>
            )}
          </div>

          <div className="border-t p-3 flex justify-end gap-2 bg-gray-50">
            <Buttons
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
            >
              <span role="img" aria-label="edit">✏️</span> Edit
            </Buttons>
            <Buttons onClick={handleDeletePlant} variant="danger">
              <span role="img" aria-label="delete">🗑</span> Delete
            </Buttons>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditPlantModal
          plant={plant}
          onClose={() => setShowEditModal(false)}
          onUpdate={(updatedPlant) =>
            setPlants((prev) => prev.map((p) => (p.id === plant.id ? updatedPlant : p)))
          }
        />
      )}
    </div>
  );
}
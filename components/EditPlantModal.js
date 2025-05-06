import { useState } from "react";

export default function EditPlantModal({ plant, onClose, onUpdate }) {
  const initialFields = {
    "Plant name": plant.fields["Plant name"] || "",
    "Detailed name": plant.fields["Detailed name"] || "",
    "Yard location": plant.fields["Yard location"] || "",
    Type: plant.fields.Type || "",
    Growth: plant.fields.Growth || "",
    "Width in inches": plant.fields["Width in inches"] || "",
    "Height in inches": plant.fields["Height in inches"] || "",
    "Space in inches": plant.fields["Space in inches"] || "",
    Pruning: plant.fields.Pruning || "",
  };

  const [form, setForm] = useState(initialFields);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/updatePlant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: plant.id, fields: form }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        throw new Error(message || "Update failed");
      }

      onUpdate({ ...plant, fields: data.updatedFields });
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update plant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white rounded-lg p-4 shadow-md z-50 flex flex-col overflow-hidden">
      <div className="overflow-y-auto px-2 pb-4">
        <h2 className="text-lg font-bold mb-4 text-center">Edit Plant</h2>

        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="mb-3">
            <label className="block text-sm font-semibold mb-1">{key}</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded text-sm"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-auto pt-2 flex justify-end gap-2 border-t">
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
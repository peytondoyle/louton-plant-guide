import { useState } from "react";
import Buttons from "./Buttons";

export default function EditPlantModal({ plant, onClose, onUpdate }) {
  const [form, setForm] = useState({
    "Plant name": plant.fields["Plant name"] || "",
    "Detailed name": plant.fields["Detailed name"] || "",
    "Yard location": plant.fields["Yard location"] || "",
    Type: plant.fields.Type || "",
    Growth: plant.fields.Growth || "",
    "Width in inches": plant.fields["Width in inches"] || "",
    "Height in inches": plant.fields["Height in inches"] || "",
    "Space in inches": plant.fields["Space in inches"] || "",
    Pruning: plant.fields.Pruning || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
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
        console.log("Updating plant with fields:", form);
        const message = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        throw new Error(message || "Update failed");
      }

      onUpdate(data.updatedFields);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update plant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white rounded-lg shadow-md z-50 flex flex-col overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-20">
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

      {/* Sticky button bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-3 flex justify-end gap-2">
        <Buttons onClick={onClose}>Cancel</Buttons>
        <Buttons onClick={handleSubmit} disabled={loading} variant="primary">
          {loading ? "Saving..." : "Save"}
        </Buttons>
      </div>
    </div>
  );
}
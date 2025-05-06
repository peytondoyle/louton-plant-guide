import { useState } from "react";
import Buttons from "./Buttons";
import { YARD_LOCATION_GROUPS } from "../utils/yardLocations";

export default function EditPlantModal({ plant, onClose, onUpdate }) {
  const initialYardLocation = plant.fields["Yard location"] || "";

  const findRegion = (location) => {
    return Object.entries(YARD_LOCATION_GROUPS).find(([_, beds]) =>
      beds.includes(location)
    )?.[0] || "";
  };

  const [region, setRegion] = useState(findRegion(initialYardLocation));
  const [form, setForm] = useState({
    "Plant name": plant.fields["Plant name"] || "",
    "Detailed name": plant.fields["Detailed name"] || "",
    "Yard location": initialYardLocation,
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

  const regionOptions = Object.keys(YARD_LOCATION_GROUPS);
  const locationOptions = region ? YARD_LOCATION_GROUPS[region] : [];

  return (
    <div className="absolute inset-0 bg-white rounded-lg shadow-md z-50 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-20">
        <h2 className="text-lg font-bold mb-4 text-center">Edit Plant</h2>
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="mb-3">
            <label className="block text-sm font-semibold mb-1">{key}</label>
            {key === "Yard location" ? (
              <div className="flex gap-2">
                <select
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    handleChange("Yard location", "");
                  }}
                  className="w-1/2 border px-3 py-2 rounded text-sm"
                >
                  <option value="">Select Region</option>
                  {regionOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <select
                  value={value}
                  onChange={(e) => handleChange("Yard location", e.target.value)}
                  className="w-1/2 border px-3 py-2 rounded text-sm"
                  disabled={!region}
                >
                  <option value="">Select Location</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                type="text"
                className="w-full border px-3 py-2 rounded text-sm"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-3 flex justify-end gap-2">
        <Buttons onClick={onClose}>Cancel</Buttons>
        <Buttons onClick={handleSubmit} disabled={loading} variant="primary">
          {loading ? "Saving..." : "Save"}
        </Buttons>
      </div>
    </div>
  );
}
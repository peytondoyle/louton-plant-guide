export const YARD_LOCATION_GROUPS = {
  "Front yard": [
    "Left of stoop bed",
    "Right of stoop bed",
    "Sunroom wraparound bed",
  ],
  "Side yard": [
    "Burning bush bed",
    "Fence bed: back",
    "Fence bed: front",
    "Pine bed",
  ],
  "Back yard": [
    "Saucer magnolia bed",
    "Gingko bed",
    "Wax myrtle bed",
    "Mountain laurel bed",
    "Shed bed",
    "Raised bed A: shed",
    "Raised bed B: peach tree",
    "Peach tree bed",
    "Dogwood bed",
    "AC bed",
    "Patio bed",
  ],
};

// Optional: Flattened array if you just want all locations in one list
export const ALL_YARD_LOCATIONS = Object.values(YARD_LOCATION_GROUPS).flat();
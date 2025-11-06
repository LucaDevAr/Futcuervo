"use client";

import { useState } from "react";

const initialFormData = {
  fullName: "",
  displayName: "", // Added displayName field
  nicknames: "",
  birthdate: null,
  debutDate: null,
  retirementDate: null,
  nationality: {
    name: "",
    flagImage: "",
  },
  goals: 0,
  appearances: 0,
  redCards: 0,
  positions: [],
  profileImage: "",
  actionImage: "",
  jerseysUsed: [],
};

export function usePlayerForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [titles, setTitles] = useState([]);
  const [careerPath, setCareerPath] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numValue = value === "" ? 0 : Number.parseInt(value);
    setFormData((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleCountrySelect = (country, countries) => {
    const selectedCountry = countries.find((c) => c.name === country);
    setFormData((prev) => ({
      ...prev,
      nationality: {
        name: country,
        flagImage: selectedCountry?.flag || "",
      },
    }));
  };

  const handlePositionToggle = (position) => {
    setFormData((prev) => {
      const positions = [...prev.positions];
      if (positions.includes(position)) {
        return { ...prev, positions: positions.filter((p) => p !== position) };
      } else {
        return { ...prev, positions: [...positions, position] };
      }
    });
  };

  const handleShirtToggle = (shirtId) => {
    setFormData((prev) => {
      const jerseys = [...prev.jerseysUsed];
      if (jerseys.includes(shirtId)) {
        return { ...prev, jerseysUsed: jerseys.filter((j) => j !== shirtId) };
      } else {
        return { ...prev, jerseysUsed: [...jerseys, shirtId] };
      }
    });
  };

  return {
    formData,
    titles,
    careerPath,
    setTitles,
    setCareerPath,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleCountrySelect,
    handlePositionToggle,
    handleShirtToggle,
  };
}

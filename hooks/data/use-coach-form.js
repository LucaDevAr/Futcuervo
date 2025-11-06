"use client";

import { useState, useEffect } from "react";

export function useCoachForm(initialData) {
  const [formData, setFormData] = useState({
    fullName: "",
    nicknames: "",
    birthdate: null,
    nationality: {
      name: "",
      flagImage: "",
    },
    appearances: 0,
    profileImage: "",
    actionImage: "",
  });

  const [titles, setTitles] = useState([]);
  const [careerPath, setCareerPath] = useState([]);

  // Update form data when initialData changes
  useEffect(() => {
    console.log(
      "useCoachForm useEffect triggered with initialData:",
      initialData
    );

    if (initialData && initialData._id) {
      // Make sure we have actual data, not just an empty object
      console.log("Processing initial data:", {
        fullName: initialData.fullName,
        nicknames: initialData.nicknames,
        birthdate: initialData.birthdate,
        nationality: initialData.nationality,
        appearances: initialData.appearances,
        titles: initialData.titles,
        careerPath: initialData.careerPath,
      });

      // Update form data
      const newFormData = {
        fullName: initialData.fullName || "",
        nicknames: Array.isArray(initialData.nicknames)
          ? initialData.nicknames.join(", ")
          : "",
        birthdate: initialData.birthdate
          ? new Date(initialData.birthdate)
          : null,
        nationality: {
          name: initialData.nationality?.name || "",
          flagImage: initialData.nationality?.flagImage || "",
        },
        appearances: initialData.appearances || 0,
        profileImage: initialData.profileImage || "",
        actionImage: initialData.actionImage || "",
      };

      console.log("Setting new form data:", newFormData);
      setFormData(newFormData);

      // Update titles
      const newTitles = Array.isArray(initialData.titles)
        ? initialData.titles.map((title) => ({
            name: title.name || "",
            image: title.image || "",
            year: title.year?.toString() || "",
          }))
        : [];

      console.log("Setting new titles:", newTitles);
      setTitles(newTitles);

      // Update career path - handle both populated and non-populated club data
      const newCareerPath = Array.isArray(initialData.careerPath)
        ? initialData.careerPath.map((career) => {
            console.log("Processing career entry:", career);

            // Handle different formats of club data
            let clubId = "";
            let leagueId = "";

            if (typeof career.club === "string") {
              clubId = career.club;
            } else if (career.club && typeof career.club === "object") {
              // If club is populated (has _id, name, etc.)
              clubId = career.club._id || career.club.toString();
              // Get league from populated club data
              if (career.club.league) {
                leagueId =
                  typeof career.club.league === "string"
                    ? career.club.league
                    : career.club.league._id || career.club.league.toString();
              }
            }

            const processedCareer = {
              club: clubId,
              league: leagueId,
              joinedDate: career.joinedDate
                ? new Date(career.joinedDate)
                : null,
              leftDate: career.leftDate ? new Date(career.leftDate) : null,
            };

            console.log("Processed career entry:", processedCareer);
            return processedCareer;
          })
        : [];

      console.log("Setting new career path:", newCareerPath);
      setCareerPath(newCareerPath);
    }
  }, [initialData]);

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
  };
}

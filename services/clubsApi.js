const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Fetch all clubs from the API
 */
export const fetchClubs = async () => {
  try {
    const response = await fetch(`${API_URL}/api/clubs`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch clubs");
    }

    const data = await response.json();
    return data.clubs || [];
  } catch (error) {
    console.error("[v0] Error fetching clubs:", error);
    throw error;
  }
};

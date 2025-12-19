import { toast } from "sonner";

export async function createLeague(newLeague) {
  try {
    const response = await fetch("/api/admin/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLeague),
    });

    if (response.ok) {
      const createdLeague = await response.json();
      toast.success("Liga creada correctamente");
      return createdLeague._id;
    } else {
      toast.error("Error al crear la liga");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Error al crear la liga");
    return null;
  }
}

export async function createClub(newClub, leagueId) {
  try {
    const response = await fetch("/api/admin/clubs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newClub, league: leagueId || newClub.league }),
    });

    if (response.ok) {
      const createdClub = await response.json();
      toast.success("Club creado correctamente");
      return createdClub._id;
    } else {
      toast.error("Error al crear el club");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Error al crear el club");
    return null;
  }
}

export async function submitPlayer(
  formData,
  titles,
  careerPath,
  clubsStats = []
) {
  try {
    if (!formData.fullName) {
      toast.error("El nombre del jugador es obligatorio");
      return false;
    }

    const nicknames = formData.nicknames
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n);

    const playerData = {
      ...formData,
      nicknames,
      titles,
      careerPath,
      clubsStats,
    };

    const response = await fetch("/api/admin/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerData),
    });

    if (response.ok) {
      toast.success("Jugador creado correctamente");
      return true;
    } else {
      const error = await response.json();
      toast.error(error.message || "Error al crear el jugador");
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Error al crear el jugador");
    return false;
  }
}

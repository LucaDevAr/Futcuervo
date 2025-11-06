import { toast } from "sonner";

export async function submitCoach(formData, titles, careerPath) {
  try {
    if (!formData.fullName) {
      toast.error("El nombre del entrenador es obligatorio");
      return false;
    }

    const nicknames = formData.nicknames
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n);

    const coachData = {
      ...formData,
      nicknames,
      titles: titles.map((title) => ({
        ...title,
        year: title.year ? Number.parseInt(title.year) : undefined,
      })),
      careerPath,
    };

    console.log("Enviando datos del entrenador:", coachData);

    const response = await fetch("/api/admin/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coachData),
    });

    if (response.ok) {
      toast.success("Entrenador creado correctamente");
      return true;
    } else {
      const error = await response.json();
      toast.error(error.message || "Error al crear el entrenador");
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Error al crear el entrenador");
    return false;
  }
}

export async function updateCoach(coachId, formData, titles, careerPath) {
  try {
    if (!formData.fullName) {
      toast.error("El nombre del entrenador es obligatorio");
      return false;
    }

    const nicknames = formData.nicknames
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n);

    const coachData = {
      ...formData,
      nicknames,
      titles: titles.map((title) => ({
        ...title,
        year: title.year ? Number.parseInt(title.year) : undefined,
      })),
      careerPath,
    };

    console.log("Actualizando datos del entrenador:", coachData);

    const response = await fetch(`/api/admin/coaches/${coachId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(coachData),
    });

    if (response.ok) {
      toast.success("Entrenador actualizado correctamente");
      return true;
    } else {
      const error = await response.json();
      toast.error(error.message || "Error al actualizar el entrenador");
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    toast.error("Error al actualizar el entrenador");
    return false;
  }
}

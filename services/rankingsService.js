import clubs from "@/lib/data/clubs";

class RankingsService {
  constructor() {
    this.STORAGE_KEYS = {
      USERS: "futear_users",
      SCORES: "futear_scores",
      CURRENT_USER: "futear_current_user",
    };
  }

  // User management
  getCurrentUser() {
    if (typeof window === "undefined") return null;
    const userData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
    return userData ? JSON.parse(userData) : null;
  }

  setCurrentUser(user) {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.saveUser(user);
  }

  saveUser(user) {
    if (typeof window === "undefined") return;
    const users = this.getAllUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }

    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getAllUsers() {
    if (typeof window === "undefined") return [];
    const usersData = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return usersData ? JSON.parse(usersData) : [];
  }

  // Score management
  addScore(score) {
    if (typeof window === "undefined") return;
    const scores = this.getAllScores();
    scores.push(score);
    localStorage.setItem(this.STORAGE_KEYS.SCORES, JSON.stringify(scores));

    // Update user total points
    const user = this.getCurrentUser();
    if (user) {
      user.totalPoints += score.points;
      this.setCurrentUser(user);
    }
  }

  getAllScores() {
    if (typeof window === "undefined") return [];
    const scoresData = localStorage.getItem(this.STORAGE_KEYS.SCORES);
    return scoresData ? JSON.parse(scoresData) : [];
  }

  // Rankings calculation
  getUserRankings(filters) {
    const scores = this.getFilteredScores(filters);
    const users = this.getAllUsers();

    const userScores = new Map();
    const userGameCounts = new Map();

    scores.forEach((score) => {
      const currentPoints = userScores.get(score.userId) || 0;
      const currentGames = userGameCounts.get(score.userId) || 0;

      userScores.set(score.userId, currentPoints + score.points);
      userGameCounts.set(score.userId, currentGames + 1);
    });

    const rankings = [];
    userScores.forEach((points, userId) => {
      const user = users.find((u) => u.id === userId);
      if (user && (!filters.teamId || user.selectedTeam === filters.teamId)) {
        const team = user.selectedTeam
          ? clubs.find((t) => t.id === user.selectedTeam)
          : undefined;
        rankings.push({
          userId: user.id,
          userName: user.name,
          teamId: user.selectedTeam,
          teamName: team?.name,
          points,
          rank: 0,
          gamesPlayed: userGameCounts.get(userId) || 0,
        });
      }
    });

    rankings.sort((a, b) => b.points - a.points);
    rankings.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return rankings;
  }

  getTeamRankings(filters) {
    const scores = this.getFilteredScores(filters);
    const users = this.getAllUsers();

    const teamScores = new Map();

    scores.forEach((score) => {
      const user = users.find((u) => u.id === score.userId);
      if (user?.selectedTeam) {
        const current = teamScores.get(user.selectedTeam) || {
          points: 0,
          playerCount: 0,
        };
        teamScores.set(user.selectedTeam, {
          points: current.points + score.points,
          playerCount: current.playerCount,
        });
      }
    });

    const teamPlayers = new Map();
    users.forEach((user) => {
      if (user.selectedTeam) {
        if (!teamPlayers.has(user.selectedTeam)) {
          teamPlayers.set(user.selectedTeam, new Set());
        }
        teamPlayers.get(user.selectedTeam).add(user.id);
      }
    });

    const rankings = [];
    teamScores.forEach((data, teamId) => {
      const team = TEAMS.find((t) => t.id === teamId);
      const playerCount = teamPlayers.get(teamId)?.size || 0;

      if (team && playerCount > 0) {
        rankings.push({
          teamId: team.id,
          teamName: team.name,
          teamLogo: team.logo,
          totalPoints: data.points,
          playerCount,
          averagePoints: Math.round(data.points / playerCount),
          rank: 0,
        });
      }
    });

    rankings.sort((a, b) => b.totalPoints - a.totalPoints);
    rankings.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return rankings;
  }

  getFilteredScores(filters) {
    const allScores = this.getAllScores();
    const now = new Date();

    return allScores.filter((score) => {
      const scoreDate = new Date(score.date);

      switch (filters.period) {
        case "daily":
          return scoreDate.toDateString() === now.toDateString();
        case "weekly":
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          return scoreDate >= weekStart;
        case "monthly":
          return (
            scoreDate.getMonth() === now.getMonth() &&
            scoreDate.getFullYear() === now.getFullYear()
          );
        case "yearly":
          return scoreDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }
}

export const rankingsService = new RankingsService();

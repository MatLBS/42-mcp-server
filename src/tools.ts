import { z } from "zod";
import { axiosInstance, Tool } from "./utils.js";

function toResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export const tools: Record<string, Tool> = {
  // ==================== PROFILS & PROGRESSION ====================
  "42-get-user": {
    config: {
      title: "Get User",
      description: "Get a 42 user's full profile by numeric ID or login",
      inputSchema: {
        idOrLogin: z
          .string()
          .describe("Numeric user ID or login (e.g. '12345' or 'mlebrass')"),
      },
    },
    handler: async ({ idOrLogin }: any) => {
      const response = await axiosInstance.get(
        `/v2/users/${idOrLogin}`,
      );
      return toResult(response.data);
    },
  },

  "42-search-users": {
    config: {
      title: "Search Users",
      description: "List/search 42 users with optional filters, paginated",
      inputSchema: {
        campusId: z.number().optional().describe("Filter by campus ID"),
        login: z.string().optional().describe("Filter by login"),
        poolYear: z
          .string()
          .optional()
          .describe("Filter by piscine year (e.g. '2024')"),
        poolMonth: z
          .string()
          .optional()
          .describe("Filter by piscine month (e.g. 'july')"),
        pageSize: z.number().default(30).describe("Page size"),
        pageNumber: z.number().default(1).describe("Page number"),
      },
    },
    handler: async ({
      campusId,
      login,
      poolYear,
      poolMonth,
      pageSize,
      pageNumber,
    }: any) => {
      const response = await axiosInstance.get(`/v2/users`, {
        params: {
          "filter[campus_id]": campusId,
          "filter[login]": login,
          "filter[pool_year]": poolYear,
          "filter[pool_month]": poolMonth,
          "page[size]": pageSize,
          "page[number]": pageNumber,
        },
      });
      return toResult(response.data);
    },
  },

  "42-get-user-cursus": {
    config: {
      title: "Get User Cursus",
      description:
        "Get a user's progression across cursus (level, skills, blackholed_at)",
      inputSchema: {
        idOrLogin: z.string().describe("Numeric user ID or login"),
      },
    },
    handler: async ({ idOrLogin }: any) => {
      const response = await axiosInstance.get(
        `/v2/users/${idOrLogin}/cursus_users`,
      );
      return toResult(response.data);
    },
  },

  "42-get-user-projects": {
    config: {
      title: "Get User Projects",
      description:
        "Get a user's project statuses (validated/failed, mark, team)",
      inputSchema: {
        idOrLogin: z.string().describe("Numeric user ID or login"),
        cursusId: z.number().optional().describe("Filter by cursus ID"),
      },
    },
    handler: async ({ idOrLogin, cursusId }: any) => {
      const response = await axiosInstance.get(
        `/v2/users/${idOrLogin}/projects_users`,
        { params: { "filter[cursus_id]": cursusId } },
      );
      return toResult(response.data);
    },
  },

  "42-get-user-achievements": {
    config: {
      title: "Get User Achievements",
      description: "Get the achievements (badges) a user has earned",
      inputSchema: {
        idOrLogin: z.string().describe("Numeric user ID or login"),
      },
    },
    handler: async ({ idOrLogin }: any) => {
      let userId = idOrLogin;
      if (!/^\d+$/.test(idOrLogin)) {
        const user = await axiosInstance.get(`/v2/users/${idOrLogin}`);
        userId = user.data.id;
      }
      const response = await axiosInstance.get(`/v2/achievements_users`, {
        params: { "filter[user_id]": userId },
      });
      return toResult(response.data);
    },
  },

  "42-get-user-quests": {
    config: {
      title: "Get User Quests",
      description: "Get a user's quest progress (in-progress and validated quests)",
      inputSchema: {
        idOrLogin: z.string().describe("Numeric user ID or login"),
      },
    },
    handler: async ({ idOrLogin }: any) => {
      const response = await axiosInstance.get(
        `/v2/users/${idOrLogin}/quests_users`,
      );
      return toResult(response.data);
    },
  },

  "42-get-user-titles": {
    config: {
      title: "Get User Titles",
      description: "Get the titles a user has unlocked",
      inputSchema: {
        idOrLogin: z.string().describe("Numeric user ID or login"),
      },
    },
    handler: async ({ idOrLogin }: any) => {
      const response = await axiosInstance.get(
        `/v2/users/${idOrLogin}/titles`,
      );
      return toResult(response.data);
    },
  },

  // ==================== ÉQUIPES ====================
  "42-get-user-teams": {
    config: {
      title: "Get User Teams",
      description:
        "Get the teams a user has been part of for project defenses (composition, status, final mark)",
      inputSchema: {
        idOrLogin: z.string().describe("Numeric user ID or login"),
        pageSize: z.number().default(30).describe("Page size"),
        pageNumber: z.number().default(1).describe("Page number"),
      },
    },
    handler: async ({ idOrLogin, pageSize, pageNumber }: any) => {
      const response = await axiosInstance.get(
        `/v2/users/${idOrLogin}/teams`,
        { params: { "page[size]": pageSize, "page[number]": pageNumber } },
      );
      return toResult(response.data);
    },
  },

  "42-get-team": {
    config: {
      title: "Get Team",
      description:
        "Get full details of a team by ID (members, status, final mark, repo url)",
      inputSchema: {
        teamId: z.number().describe("Team ID"),
      },
    },
    handler: async ({ teamId }: any) => {
      const response = await axiosInstance.get(`/v2/teams/${teamId}`);
      return toResult(response.data);
    },
  },

  // ==================== COALITIONS & CLASSEMENT ====================
  "42-get-user-coalition": {
    config: {
      title: "Get User Coalition",
      description: "Get a user's coalition membership and current score",
      inputSchema: {
        idOrLogin: z.string().describe("Numeric user ID or login"),
      },
    },
    handler: async ({ idOrLogin }: any) => {
      const response = await axiosInstance.get(
        `/v2/users/${idOrLogin}/coalitions_users`,
      );
      return toResult(response.data);
    },
  },

  "42-get-coalition-scores": {
    config: {
      title: "Get Coalition Scores",
      description: "Get the score history (points gained/lost) of a coalition",
      inputSchema: {
        coalitionId: z.number().describe("Coalition ID"),
        pageSize: z.number().default(30).describe("Page size"),
        pageNumber: z.number().default(1).describe("Page number"),
      },
    },
    handler: async ({ coalitionId, pageSize, pageNumber }: any) => {
      const response = await axiosInstance.get(
        `/v2/coalitions/${coalitionId}/scores`,
        { params: { "page[size]": pageSize, "page[number]": pageNumber } },
      );
      return toResult(response.data);
    },
  },

  // ==================== VIE DE CAMPUS ====================
  "42-list-campus": {
    config: {
      title: "List Campus",
      description: "List all 42 campuses, paginated",
      inputSchema: {
        pageSize: z.number().default(30).describe("Page size"),
        pageNumber: z.number().default(1).describe("Page number"),
      },
    },
    handler: async ({ pageSize, pageNumber }: any) => {
      const response = await axiosInstance.get(`/v2/campus`, {
        params: { "page[size]": pageSize, "page[number]": pageNumber },
      });
      return toResult(response.data);
    },
  },

  "42-get-campus-locations": {
    config: {
      title: "Get Campus Locations",
      description:
        "Get workstation locations for a campus (who's logged in where)",
      inputSchema: {
        campusId: z.number().describe("Campus ID"),
        activeOnly: z
          .boolean()
          .default(true)
          .describe("Only return currently active (logged in) locations"),
      },
    },
    handler: async ({ campusId, activeOnly }: any) => {
      const response = await axiosInstance.get(
        `/v2/campus/${campusId}/locations`,
        { params: { "filter[active]": activeOnly } },
      );
      return toResult(response.data);
    },
  },

  "42-list-events": {
    config: {
      title: "List Events",
      description: "List upcoming events for a campus, paginated",
      inputSchema: {
        campusId: z.number().describe("Campus ID"),
        pageSize: z.number().default(30).describe("Page size"),
        pageNumber: z.number().default(1).describe("Page number"),
      },
    },
    handler: async ({ campusId, pageSize, pageNumber }: any) => {
      const response = await axiosInstance.get(
        `/v2/campus/${campusId}/events`,
        { params: { "page[size]": pageSize, "page[number]": pageNumber } },
      );
      return toResult(response.data);
    },
  },

  "42-get-event": {
    config: {
      title: "Get Event",
      description: "Get details of a specific event by ID",
      inputSchema: {
        eventId: z.number().describe("Event ID"),
      },
    },
    handler: async ({ eventId }: any) => {
      const response = await axiosInstance.get(`/v2/events/${eventId}`);
      return toResult(response.data);
    },
  },

  "42-list-exams": {
    config: {
      title: "List Exams",
      description: "List exam dates for a campus, paginated",
      inputSchema: {
        campusId: z.number().describe("Campus ID"),
        pageSize: z.number().default(30).describe("Page size"),
        pageNumber: z.number().default(1).describe("Page number"),
      },
    },
    handler: async ({ campusId, pageSize, pageNumber }: any) => {
      const response = await axiosInstance.get(
        `/v2/campus/${campusId}/exams`,
        { params: { "page[size]": pageSize, "page[number]": pageNumber } },
      );
      return toResult(response.data);
    },
  },
};

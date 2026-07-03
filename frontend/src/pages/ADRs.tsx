import api from "../api/axios";

/**
 * Must match backend AdrQueryDto exactly
 */
export interface AdrQuery {
  page?: number;
  limit?: number;
  status?: "Draft" | "Proposed" | "Accepted" | "Rejected" | "Archived";
  authorId?: string;
  tags?: string; // backend expects comma-separated string
}

/**
 * ADR type (matches backend populate)
 */
export interface Adr {
  _id: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  status: string;
  tags: string[];

  authorId: {
    _id: string;
    name: string;
    email: string;
  };

  createdAt: string;
}

/**
 * CREATE DTO
 */
export interface CreateAdrDto {
  title: string;
  problemStatement: string;
  proposedSolution: string;
  tags?: string[];
}

/**
 * UPDATE DTO
 */
export interface UpdateAdrDto {
  title?: string;
  problemStatement?: string;
  proposedSolution?: string;
  tags?: string[];
  expectedBenefits?: string;
  actualBenefits?: string;
  lessonsLearned?: string;
}

/**
 * SERVICE
 */
export const AdrService = {
  // GET ALL ADRs (RBAC handled by backend)
  getAll: async (query: AdrQuery) => {
    const res = await api.get("/adrs", { params: query });
    return res.data;
  },

  // GET ONE ADR
  getById: async (id: string) => {
    const res = await api.get(`/adrs/${id}`);
    return res.data;
  },

  // CREATE ADR
  create: async (data: CreateAdrDto) => {
    const res = await api.post("/adrs", data);
    return res.data;
  },

  // UPDATE ADR
  update: async (id: string, data: UpdateAdrDto) => {
    const res = await api.put(`/adrs/${id}`, data);
    return res.data;
  },

  // ARCHIVE ADR
  archive: async (id: string) => {
    const res = await api.patch(`/adrs/${id}/archive`);
    return res.data;
  },

  // UPDATE STATUS
  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/adrs/${id}/status`, { status });
    return res.data;
  },

  // ADD DEPENDENCY
  addDependency: async (id: string, dependencyId: string) => {
    const res = await api.patch(`/adrs/${id}/dependencies`, {
      dependencyId,
    });
    return res.data;
  },

  // REMOVE DEPENDENCY
  removeDependency: async (id: string, dependencyId: string) => {
    const res = await api.delete(
      `/adrs/${id}/dependencies/${dependencyId}`
    );
    return res.data;
  },

  // GET DEPENDENCIES
  getDependencies: async (id: string) => {
    const res = await api.get(`/adrs/${id}/dependencies`);
    return res.data;
  },
};
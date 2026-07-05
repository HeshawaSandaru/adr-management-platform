import api from "../api/axios";



export interface Adr {
  _id: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  status: string;

  tags: string[];

  expectedBenefits?: string;
  actualBenefits?: string;
  lessonsLearned?: string;

  alternativeAnalysis?: {
    alternative: string;
    pros?: string[];
    cons?: string[];
  }[];

  dependencies?: {
    _id: string;
    title: string;
    status: string;
  }[];

  authorId: {
    _id: string;
    name: string;
    email: string;
  };

  createdAt: string;
  updatedAt?: string;
}



export interface AdrQuery {
  page?: number;
  limit?: number;
  status?: string;
  authorId?: string;
  title?: string;
  tags?: string; // backend expects comma-separated string
}


export interface AdrListResponse {
  data: Adr[];
  total: number;
  page: number;
  limit: number;
}



export interface CreateAdrDto {
  title: string;
  problemStatement: string;
  proposedSolution: string;

  tags?: string[];

  expectedBenefits?: string;
  actualBenefits?: string;
  lessonsLearned?: string;

  alternativeAnalysis?: {
    alternative: string;
    pros?: string[];
    cons?: string[];
  }[];

  dependencies?: string[];
}



export interface UpdateAdrDto {
  title?: string;
  problemStatement?: string;
  proposedSolution?: string;

  status?: string;

  tags?: string[];

  expectedBenefits?: string;
  actualBenefits?: string;
  lessonsLearned?: string;

  alternativeAnalysis?: {
    alternative: string;
    pros?: string[];
    cons?: string[];
  }[];

  dependencies?: string[];
}



export const AdrService = {
  /* -------- LIST ADRs -------- */
  getAll: async (query: AdrQuery): Promise<AdrListResponse> => {
    const res = await api.get("/adrs", { params: query });
    return res.data;
  },

  /* -------- GET SINGLE ADR -------- */
  getById: async (id: string): Promise<Adr> => {
    const res = await api.get(`/adrs/${id}`);
    return res.data;
  },

  /* -------- CREATE ADR -------- */
  create: async (data: CreateAdrDto): Promise<Adr> => {
    const res = await api.post("/adrs", data);
    return res.data;
  },

  /* -------- UPDATE ADR -------- */
  update: async (id: string, data: UpdateAdrDto): Promise<Adr> => {
    const res = await api.put(`/adrs/${id}`, data);
    return res.data;
  },

  /* -------- ARCHIVE ADR -------- */
  archive: async (id: string): Promise<Adr> => {
    const res = await api.patch(`/adrs/${id}/archive`);
    return res.data;
  },

  /* -------- STATUS UPDATE -------- */
  updateStatus: async (
    id: string,
    status: string
  ): Promise<Adr> => {
    const res = await api.patch(`/adrs/${id}/status`, { status });
    return res.data;
  },

  /* -------- ADD DEPENDENCY -------- */
  addDependency: async (
    id: string,
    dependencyId: string
  ): Promise<Adr> => {
    const res = await api.patch(`/adrs/${id}/dependencies`, {
      dependencyId,
    });
    return res.data;
  },

  /* -------- REMOVE DEPENDENCY -------- */
  removeDependency: async (
    id: string,
    dependencyId: string
  ): Promise<Adr> => {
    const res = await api.delete(
      `/adrs/${id}/dependencies/${dependencyId}`
    );
    return res.data;
  },

  /* -------- GET DEPENDENCIES -------- */
  getDependencies: async (id: string) => {
    const res = await api.get(`/adrs/${id}/dependencies`);
    return res.data;
  },
};
import api from "../api/axios";

export type AdrStatus =
  | "Draft"
  | "Proposed"
  | "Accepted"
  | "Rejected"
  | "Archived";

export interface Adr {
  reviews?: Review[];
  _id: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  status: AdrStatus;
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
    status: AdrStatus;
  }[];
  authorId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export type ReviewDecision = "approved" | "rejected" | "changes_requested";

export interface Review {
  _id: string;
  reviewerId: {
    _id: string;
    name: string;
    email: string;
  };
  decision: ReviewDecision;
  comment: string;
  createdAt: string;
}

export interface AdrQuery {
  page?: number;
  limit?: number;
  status?: AdrStatus;
  authorName?: string;
  reviewerName?: string;
  title?: string;
  tags?: string; 
  fromDate?: string;
  toDate?: string;
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

export interface GraphNode {
  id: string;
  title: string;
  status: AdrStatus;
  authorId?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface AdrGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const AdrService = {
  /* -------- LIST ADRs -------- */
  getAll: async (query: AdrQuery): Promise<AdrListResponse> => {
    // Clean out empty variables to prevent broken string generation
    const cleanedQuery = Object.entries(query).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const res = await api.get("/adrs", { params: cleanedQuery });
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
  updateStatus: async (id: string, status: AdrStatus): Promise<Adr> => {
    const res = await api.patch(`/adrs/${id}/status`, { status });
    return res.data;
  },

  /* -------- ADD DEPENDENCY -------- */
  addDependency: async (id: string, dependencyId: string): Promise<Adr> => {
    const res = await api.patch(`/adrs/${id}/dependencies`, {
      dependencyId,
    });
    return res.data;
  },

  /* -------- REMOVE DEPENDENCY -------- */
  removeDependency: async (id: string, dependencyId: string): Promise<Adr> => {
    const res = await api.delete(`/adrs/${id}/dependencies/${dependencyId}`);
    return res.data;
  },

  /* -------- GET DEPENDENCIES -------- */
  getDependencies: async (id: string) => {
    const res = await api.get(`/adrs/${id}/dependencies`);
    return res.data;
  },

  /* -------- GET REVIEWS -------- */
  getReviews: async (id: string): Promise<Review[]> => {
    const res = await api.get(`/adrs/${id}/reviews`);
    return res.data;
  },

  /* -------- CREATE REVIEW -------- */
  createReview: async (
    id: string,
    data: { decision: ReviewDecision; comment: string },
  ): Promise<Review> => {
    const res = await api.post(`/adrs/${id}/reviews`, data);
    return res.data;
  },

  /* -------- DEPENDENCY GRAPH -------- */
  getGraph: async (): Promise<AdrGraph> => {
    const res = await api.get("/adrs/graph");
    return res.data;
  },
};
export type AdrStatus =
  | "Draft"
  | "Proposed"
  | "Accepted"
  | "Rejected"
  | "Archived";

export interface AlternativeAnalysis {
  alternative: string;
  pros: string[];
  cons: string[];
}

export interface Adr {
  _id: string;
  title: string;
  problemStatement: string;
  proposedSolution: string;
  status: AdrStatus;
  tags: string[];
  expectedBenefits?: string;
  actualBenefits?: string;
  lessonsLearned?: string;

  alternativeAnalysis?: AlternativeAnalysis[];

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
  updatedAt: string;
}

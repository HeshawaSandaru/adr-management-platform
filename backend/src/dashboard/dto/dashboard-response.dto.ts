export class DashboardResponseDto {
  totalAdrs!: number;

  draft!: number;
  proposed!: number;
  accepted!: number;
  rejected!: number;
  archived!: number;

  totalReviews!: number;
  approvedReviews!: number;
  rejectedReviews!: number;
  changesRequestedReviews!: number;
}
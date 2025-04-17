
export interface RecurrentTask {
  id: string;
  name: string;
  type: string;
  description: string;
  lastRunStatus: string | null;
  lastRunAt: string | null;
  nextRunAt: string | null;
  frequency: string;
  pendingCount?: number;
}

export interface RecurrentTaskDetail extends RecurrentTask {
  configuration: Record<string, any>;
}

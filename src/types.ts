import type { ProviderId } from "./lib/providers";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
}

export interface Prd {
  id: string;
  title: string;
  description: string;
  content: string;
  tasks: Task[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  provider: ProviderId;
  apiKey: string;
  model: string;
}

export type Theme = "light" | "dark" | "system";

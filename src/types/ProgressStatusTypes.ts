export enum ProgressStatusEnum {
  NOT_REQUIRED = "NOT_REQUIRED",
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  DONE = "DONE",
  ERROR = "ERROR",
}

export enum ProgressStatusState {
  DOWNLOAD = "DOWNLOAD",
  READING = "READING",
  PARSING = "PARSING",
}

export interface ProgressStatusError {
  state: ProgressStatusState;
  label: string;
}

export interface ProgressStatus {
  downloadProgressStatus?: ProgressStatusEnum;
  downloadProgress?: number;
  uploadProgressStatus?: ProgressStatusEnum;
  uploadProgress?: number;
  parseProgressStatus?: ProgressStatusEnum;
  parseProgress?: number;
  error?: ProgressStatusError;
}

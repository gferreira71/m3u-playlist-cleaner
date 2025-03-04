export enum ParsingStateEnum {
  READING = "READING",
  PARSING = "PARSING",
}

export interface ParsingProcessState {
  parsingState: ParsingStateEnum;
  progress?: number;
  error?: string;
}

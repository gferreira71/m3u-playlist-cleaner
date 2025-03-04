export enum SourceTypeEnum {
  UPLOADFILE = "UPLOADFILE",
  DEMO = "DEMO",
  URL = "URL",
}

export interface Source {
  type: SourceTypeEnum;
  fileName?: string;
  url?: string;
  value: string | File;
}

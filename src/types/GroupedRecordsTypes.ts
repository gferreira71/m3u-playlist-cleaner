import type { Record } from "./RecordsTypes";

export enum GroupRecordsTypeEnum {
  VOD = "VOD",
  MEDIA = "MEDIA",
  LIVE = "LIVE",
  MIXED = "MIXED",
}

export interface GroupedRecords {
  groupTitle: string;
  type: GroupRecordsTypeEnum;
  records: Record[];
}

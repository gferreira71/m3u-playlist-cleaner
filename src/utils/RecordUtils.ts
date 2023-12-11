import { GroupRecordsTypeEnum } from "@/types/GroupedRecordsTypes";
import type { Record } from "@/types/RecordsTypes";

export default class RecordUtils {

  public static computeGroupRecordsType(records: Record[]): GroupRecordsTypeEnum {
    const typesSet = new Set<string>();
    records.forEach((record: Record) => {
      if (record.type) {
        typesSet.add(record.type);
      }
    });
    let groupType: GroupRecordsTypeEnum;
    if (typesSet.size === 1) {
      groupType = typesSet.values().next().value as GroupRecordsTypeEnum;
    } else {
      groupType = GroupRecordsTypeEnum.MIXED;
    }
    return groupType;
  }
}
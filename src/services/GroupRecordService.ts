import { type GroupedRecords } from "@/types/GroupedRecordsTypes";
import type { Record } from "@/types/RecordsTypes";
import RecordUtils from "@/utils/RecordUtils";

function groupRecords(records: Record[]): GroupedRecords[] {
  if (!records || records.length === 0) return [];

  const groupedRecordsObj = records.reduce(
    (acc: { [key: string]: Record[] }, record: Record) => {
      if (record.groupTitle) {
        if (!acc[record.groupTitle]) {
          acc[record.groupTitle] = [];
        }
        acc[record.groupTitle].push(record);
      }
      return acc;
    },
    {}
  );

  const groupedRecordsArray: GroupedRecords[] = Object.keys(
    groupedRecordsObj
  ).map((groupTitle: string) => {
    const recordsInGroup: Record[] = groupedRecordsObj[groupTitle];
    const groupType = RecordUtils.computeGroupRecordsType(recordsInGroup);

    return {
      groupTitle: groupTitle,
      type: groupType,
      records: groupedRecordsObj[groupTitle],
    };
  });

  return groupedRecordsArray;
}

export default { groupRecords };

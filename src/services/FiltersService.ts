import type { GroupedRecords } from "@/types/GroupedRecordsTypes";
import {
  ScopeTextEnum,
  type RecordsFitlers,
} from "@/types/RecordsFiltersTypes";
import type { Record } from "@/types/RecordsTypes";

function applyFilters(
  groupedRecords: GroupedRecords[],
  filtersToApply: RecordsFitlers
): GroupedRecords[] {
  return groupedRecords
    .map((group) => {
      const filteredRecords = group.records.filter((record: Record) => {
        let passesTextFilter = false;

        if (filtersToApply.scopeText.length > 0) {
          const textToSearch = filtersToApply.text.toUpperCase();
          passesTextFilter = filtersToApply.scopeText.some((scope) => {
            switch (scope) {
              case ScopeTextEnum.NAME:
                return (
                  record.name &&
                  record.name.toUpperCase().includes(textToSearch)
                );
              case ScopeTextEnum.TVGID:
                return (
                  record.tvgParameters?.tvgId &&
                  record.tvgParameters.tvgId
                    .toUpperCase()
                    .includes(textToSearch)
                );
              case ScopeTextEnum.TVGNAME:
                return (
                  record.tvgParameters?.tvgName &&
                  record.tvgParameters.tvgName
                    .toUpperCase()
                    .includes(textToSearch)
                );
              case ScopeTextEnum.GROUPTITLE:
                return (
                  group.groupTitle &&
                  group.groupTitle.toUpperCase().includes(textToSearch)
                );
              default:
                return false;
            }
          });
        } else {
          // If no text filter provided, consider it as passed
          passesTextFilter = true;
        }

        const passesScopeFilter =
          filtersToApply.scope.length === 0 ||
          (record.type && filtersToApply.scope.includes(record.type));

        return passesTextFilter && passesScopeFilter;
      });

      // Create a new GroupedRecords object with filtered records
      return { ...group, records: filteredRecords };
    })
    .filter((group) => group.records.length > 0);
}

export default { applyFilters };

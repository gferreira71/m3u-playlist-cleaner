import { defineStore } from 'pinia';
import { type Source } from './../types/SourcesTypes';
import ParserService from '@/services/ParserService';
import FiltersService from '@/services/FiltersService';
import { ProgressStatusEnum, type ProgressStatus, ProgressStatusState } from '@/types/ProgressStatusTypes';
import { ScopeTextEnum, type RecordsFitlers } from '@/types/RecordsFiltersTypes';
import { RecordTypeEnum, type Record } from '@/types/RecordsTypes';
import { ParsingStateEnum, type ParsingProcessState } from '@/types/ParsingProcessStatusTypes';
import type { GroupedRecords } from '@/types/GroupedRecordsTypes';
import GroupRecordService from '@/services/GroupRecordService';
import RecordUtils from '@/utils/RecordUtils';

export interface RecordStoreState {
  source?: Source;
  progressStatus?: ProgressStatus;
  recordsFilters: RecordsFitlers;
  records: Record[];
  groupedRecords: GroupedRecords[];
  filteredGroupRecords: GroupedRecords[];
  selectedGroupRecords: GroupedRecords[];
  isFilteringRunning: boolean;
}

export const recordsStore = defineStore('recordsStore', {
  state: (): RecordStoreState => ({
    source: undefined,
    progressStatus: undefined,
    recordsFilters: {
      text: '',
      scope: [RecordTypeEnum.LIVE, RecordTypeEnum.MEDIA, RecordTypeEnum.VOD],
      scopeText: [ScopeTextEnum.GROUPTITLE, ScopeTextEnum.NAME]
    },
    records: [],
    // recordsFiltered: [],
    groupedRecords: [],
    filteredGroupRecords: [],
    selectedGroupRecords: [],
    isFilteringRunning: false
  }),
  getters: {
    // getRecords: (state) => state.records,
  },
  actions: {
    async changeSource(newSource: Source) {
      this.source = newSource;
      if(this.source !== newSource) {
        let fileToParse: File;
        // Init progressStatus
        this.progressStatus = {
          downloadProgress: 0,
          downloadProgressStatus: ProgressStatusEnum.NOT_REQUIRED,
          uploadProgress: 0,
          uploadProgressStatus: ProgressStatusEnum.PENDING,
          parseProgress: 0,
          parseProgressStatus: ProgressStatusEnum.PENDING,
        }
        // Download the file before parsing
        /* Can't work because of CORS policy
        if(newSource.type === SourceTypeEnum.URL) {
          fileToParse = await ParserService.downloadFileFromUrl(newSource.value as string, (progress: number | string, state: ProgressStatusEnum) => {
            if (state === ProgressStatusEnum.RUNNING && this.progressStatus) {
              this.progressStatus.downloadProgress = progress as number;
              this.progressStatus.downloadProgressStatus = ProgressStatusEnum.RUNNING;
            } else if(state === ProgressStatusEnum.ERROR && this.progressStatus) {
              this.progressStatus.error = {
                state: ProgressStatusState.DOWNLOAD,
                label: progress as string// TODO i18n key
              }
            }
          });
        } else {
          fileToParse = newSource.value as File;
        }*/
        fileToParse = newSource.value as File;
        const recordsFound: Record[] = await ParserService.parseM3UFile(fileToParse, (parsingProcessState: ParsingProcessState) => {
          // If error
          if(parsingProcessState.error && this.progressStatus) {
            this.progressStatus.error = {
              state: parsingProcessState.parsingState === ParsingStateEnum.PARSING ?
                ProgressStatusState.PARSING : ProgressStatusState.READING,
              label: "Une erreur s'est produite" // TODO i18n key
            }
          }
          if (parsingProcessState.parsingState === ParsingStateEnum.READING && this.progressStatus) {
            this.progressStatus.uploadProgress = parsingProcessState.progress;
            if(parsingProcessState.progress === 100) {
              this.progressStatus.uploadProgressStatus = ProgressStatusEnum.DONE;
            } else {
              this.progressStatus.uploadProgressStatus = ProgressStatusEnum.RUNNING;
            }
          } else if (parsingProcessState.parsingState === ParsingStateEnum.PARSING && this.progressStatus) {
            this.progressStatus.parseProgress = parsingProcessState.progress;
            if(parsingProcessState.progress === 100) {
              this.progressStatus.parseProgressStatus = ProgressStatusEnum.DONE;
            } else {
              this.progressStatus.parseProgressStatus = ProgressStatusEnum.RUNNING;
            }
          }
        });
        this.records = recordsFound;
        this.groupedRecords = GroupRecordService.groupRecords(recordsFound);
        this.filteredGroupRecords = GroupRecordService.groupRecords(recordsFound);
        this.selectedGroupRecords = [];
        // Reset filters and filteredRecords array
        this.recordsFilters = {
          text: '',
          scope: [RecordTypeEnum.LIVE, RecordTypeEnum.MEDIA, RecordTypeEnum.VOD],
          scopeText: [ScopeTextEnum.GROUPTITLE, ScopeTextEnum.NAME]
        };
      }
    },

    clearSource() {
      this.records = [];
      this.groupedRecords = [];
      this.selectedGroupRecords = [];
      this.filteredGroupRecords = [];
      this.source = undefined;
      this.recordsFilters = {
        text: '',
        scope: [RecordTypeEnum.LIVE, RecordTypeEnum.MEDIA, RecordTypeEnum.VOD],
        scopeText: [ScopeTextEnum.GROUPTITLE, ScopeTextEnum.NAME]
      };
      this.progressStatus = undefined;
    },

    applyFilters() {
      this.isFilteringRunning = true;
      setTimeout(() => {
        const filteredGroupRecords = FiltersService.applyFilters(this.groupedRecords, this.recordsFilters);
        this.filteredGroupRecords = filteredGroupRecords;
        this.isFilteringRunning = false;
      }, 0);
    },

    clearAllSelection() {
      this.selectedGroupRecords = [];
    },

    toggleGroupedRecordSelection(groupedRecord: GroupedRecords, stateToSet: boolean): void {
      const clonedGroupedRecord: GroupedRecords = { ...groupedRecord};
      const index = this.selectedGroupRecords.findIndex(
        (selectedGroupRecord) => selectedGroupRecord.groupTitle === groupedRecord.groupTitle
      );
      if (index === -1) {
        this.selectedGroupRecords = [...this.selectedGroupRecords, clonedGroupedRecord];
      } else {
        const updatedGroupedRecords = [...this.selectedGroupRecords];
        if(!stateToSet) {
          updatedGroupedRecords.splice(index, 1);
        } else {
          updatedGroupedRecords[index].records = [...groupedRecord.records];
        }
        this.selectedGroupRecords = updatedGroupedRecords;
      }
    },

    toggleRecordSelection(record: Record) {
      const existingGroupIndex = this.selectedGroupRecords.findIndex(
        (groupedRecord) => groupedRecord.groupTitle === record.groupTitle
      );
    
      if (existingGroupIndex === -1) {
        // Add new grouped record
        const newGroupedRecord = {
          groupTitle: record.groupTitle ?? 'NO GROUP',
          type: RecordUtils.computeGroupRecordsType([record]),
          records: [record],
        };
        this.selectedGroupRecords = [...this.selectedGroupRecords, newGroupedRecord];
      } else {
        // Clone the existing grouped records
        const updatedGroupedRecords = [...this.selectedGroupRecords];
        const existingGroupedRecord = { ...updatedGroupedRecords[existingGroupIndex] };
    
        // Find the index of the existing record
        const existingRecordIndex = existingGroupedRecord.records.findIndex(
          (selectedRecord) => selectedRecord.name === record.name
        );
    
        if (existingRecordIndex === -1) {
          // Add new record to existing grouped record
          existingGroupedRecord.records = [...existingGroupedRecord.records, record];
        } else {
          // Remove the existing record from the grouped record
          existingGroupedRecord.records = existingGroupedRecord.records.filter(
            (selectedRecord, index) => index !== existingRecordIndex
          );
        }
    
        // Update the grouped record in the array
        if (existingGroupedRecord.records.length > 0) {
          updatedGroupedRecords[existingGroupIndex] = existingGroupedRecord;
        } else {
          updatedGroupedRecords.splice(existingGroupIndex, 1);
        }
    
        this.selectedGroupRecords = updatedGroupedRecords;
      }
    },

    removeGroupedRecordSelection(groupedRecordToRemove: GroupedRecords): void {
      this.selectedGroupRecords = this.selectedGroupRecords.filter(
        (selectedGroupRecord) => selectedGroupRecord.groupTitle !== groupedRecordToRemove.groupTitle
      );
    },

    removeRecordSelection(recordToRemove: Record) {
      this.selectedGroupRecords.forEach((selectedGroupRecord) => {
        if (selectedGroupRecord.records.some((selectedRecord) => selectedRecord.name === recordToRemove.name)) {
          const updatedRecords = selectedGroupRecord.records.filter((selectedRecord) => selectedRecord.name !== recordToRemove.name);
          selectedGroupRecord.records = updatedRecords;
        }
      });
      this.selectedGroupRecords = this.selectedGroupRecords.filter((selectedGroupRecord) => selectedGroupRecord.records.length > 0);
    },

    downloadPlaylist(filename: string) {
      if(filename) {
        const selectedRecords = this.selectedGroupRecords.flatMap(groupedRecord => groupedRecord.records);
        ParserService.downloadM3uResults(selectedRecords, filename);
      }
    }
  },
});
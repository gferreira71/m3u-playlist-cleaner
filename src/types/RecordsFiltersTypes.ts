import { RecordTypeEnum } from './RecordsTypes';

export enum ScopeTextEnum {
    NAME = 'NAME',
    TVGID = 'TVGID',
    TVGNAME = 'TVGNAME',
    GROUPTITLE = 'GROUPTITLE'
}

export interface RecordsFitlers {
    text: string;
    scopeText: ScopeTextEnum[];
    scope: RecordTypeEnum[];
}
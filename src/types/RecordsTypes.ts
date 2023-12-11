export interface TvgParameters {
    tvgId?: string;
    tvgName?: string;
    tvgLogo?: string;
}

export enum RecordTypeEnum {
    MEDIA = 'MEDIA',
    LIVE = 'LIVE',
    VOD = 'VOD'
}

export interface Record {
    name?: string;
    link?: string;
    duration?: number;
    type?: RecordTypeEnum;
    groupTitle?: string;
    tvgParameters?: TvgParameters;
}
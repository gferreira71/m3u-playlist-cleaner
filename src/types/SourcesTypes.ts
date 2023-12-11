export enum SourceTypeEnum {
    UPLOADFILE = 'UPLOADFILE',
    DEMO = 'DEMO',
    URL = 'URL'
}

export interface Source {
    type: SourceTypeEnum;
    fileName?: string;
    value: string | File;
}
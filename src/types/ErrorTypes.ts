export enum ErrorTypeEnum {
    WRONG_M3U_HEADER = 'WRONG_M3U_HEADER',
    WRONG_FILE_EXTENSION = 'WRONG_FILE_EXTENSION',
    WRONG_FILE_SIGNATURE = 'WRONG_FILE_SIGNATURE',
    FILE_TOO_BIG = 'FILE_TOO_BIG',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
    READING_FILE_ERROR = 'READING_FILE_ERROR',
    PARSING_FILE_ERROR = 'PARSING_FILE_ERROR',
}

export interface Error {
    type: ErrorTypeEnum;
    line?: number;
    additionalLabel?: string;
}
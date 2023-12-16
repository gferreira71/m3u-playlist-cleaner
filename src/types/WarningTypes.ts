export enum WarningTypeEnum {
    UNSUPPORTED_HLS_TAG = 'UNSUPPORTED_HLS_TAG',
    UNSUPPORTED_XM3U_TAG = 'UNSUPPORTED_XM3U_TAG',
    UNKNOWN_TAG = 'UNKNOWN_TAG',
    NO_LINK_RECORD = 'NO_LINK_RECORD',
    NO_NAME_RECORD = 'NO_NAME_RECORD',
    NO_DURATION_RECORD = 'NO_DURATION_RECORD',
}

export interface Warning {
    type: WarningTypeEnum;
    line: number;
    additionalLabel?: string;
}
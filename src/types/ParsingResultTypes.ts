import type { Error } from "./ErrorTypes";
import type { Record } from "./RecordsTypes";
import type { Warning } from "./WarningTypes";

export interface ParsingResult {
    records: Record[];
    warnings: Warning[];
    errors: Error[];
}
import {
  ParsingStateEnum,
  type ParsingProcessState,
} from "@/types/ParsingProcessStatusTypes";
import { ProgressStatusEnum } from "@/types/ProgressStatusTypes";
import { RecordTypeEnum, type Record } from "@/types/RecordsTypes";
import type { ParsingResult } from "@/types/ParsingResultTypes";
import { WarningTypeEnum } from "@/types/WarningTypes";
import { ErrorTypeEnum } from "@/types/ErrorTypes";

const UNSUPPORTED_XM3U_TAG_LIST: string[] = [
  "#PLAYLIST",
  "#EXTGRP",
  "#EXTALB",
  "#EXTART",
  "#EXTGENRE",
  "#EXTM3A",
  "#EXTBYT",
  "#EXTBIN",
  "#EXTIMG",
];

function parseM3UFile(
  file: File,
  progressCallback: Function
): Promise<ParsingResult> {
  return new Promise((resolve, reject) => {
    const chunkSize = 1024 * 512; // Adjusted chunk size (512KB)
    const fileSize = file.size;
    let offset = 0;
    let firstChunk: boolean = false;
    let partialLine: string = ""; // Store the last incomplete line
    let parsedContent: string = "";

    const fileAboveOneGiga = file.size > 1024 * 1024 * 1024;
    if (fileAboveOneGiga) {
      const parsingResultInError: ParsingResult = {
        records: [],
        errors: [
          {
            type: ErrorTypeEnum.FILE_TOO_BIG,
          },
        ],
        warnings: [],
      };
      resolve(parsingResultInError);
    }

    const readChunk = async () => {
      firstChunk = offset === 0;
      const chunk = file.slice(offset, offset + chunkSize);
      const reader = new FileReader();

      reader.onload = async () => {
        const content = reader.result;
        let chunkContent = partialLine + content; // Append the previous incomplete line
        let lines = chunkContent.split(/\r?\n/);

        // Check if first line of first chunk is the right M3U header
        if (firstChunk && lines[0] !== "#EXTM3U") {
          const parsingResultError: ParsingResult = {
            records: [],
            errors: [
              {
                type: ErrorTypeEnum.WRONG_M3U_HEADER,
              },
            ],
            warnings: [],
          };
          resolve(parsingResultError);
        }

        // Keepp the last line in case it is not complete and add it to the next chunk
        const lastLineIndex = lines.length - 1;
        partialLine = lines[lastLineIndex];
        lines = lines.slice(0, lastLineIndex);

        for (const line of lines) {
          parsedContent += line + "\n"; // Add the line to parsed content
        }

        offset += chunkSize;
        const progress = Math.min(Math.round((offset / fileSize) * 100), 100);

        if (progressCallback) {
          const progressState: ParsingProcessState = {
            parsingState: ParsingStateEnum.READING,
            progress: progress,
          };
          progressCallback(progressState);
        }

        if (offset < fileSize) {
          await readChunk();
        } else {
          // Process the remaining partial line
          if (partialLine.trim() !== "") {
            parsedContent += partialLine; // Include the last incomplete line
          }

          const parsedRecords = parseM3U(parsedContent, progressCallback);
          resolve(parsedRecords); // Resolve the promise with parsed records
        }
      };
      reader.readAsText(chunk);
    };

    readChunk();
  });
}

function parseM3U(
  m3uContent: string,
  progressCallback: Function
): Promise<ParsingResult> {
  return new Promise((resolve, reject) => {
    const parsingResults: ParsingResult = {
      records: [],
      errors: [],
      warnings: [],
    };
    const parsedRecords: Record[] = [];
    const lines = m3uContent
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");
    const totalLines = lines.length;
    const batchSize = 1000;

    let index = 0;

    const processBatch = () => {
      const endIndex = Math.min(index + batchSize, totalLines);

      for (; index < endIndex; index++) {
        const line = lines[index];

        if (line.startsWith("#EXTINF:")) {
          let currentIndex = index + 1; // Start from the line after #EXTINF
          let blockContent = line; // Initialize with the current line
          const record: Record = {};

          // Extracting all lines until the start of the next record or '#'
          while (
            currentIndex < totalLines &&
            !lines[currentIndex].startsWith("#")
          ) {
            blockContent += "\n" + lines[currentIndex];
            currentIndex++;
          }
          const lastLineIndex = currentIndex - 1;

          // 'blockContent' contains the complete record block across multiple lines
          // Parse parameters and extract necessary information from 'blockContent'
          const durationMatch = blockContent.match(/#EXTINF:(-?\d+)/);
          if (durationMatch && durationMatch.length > 1) {
            record.duration = parseInt(durationMatch[1]);
          } else {
            parsingResults.warnings.push({
              line: index,
              type: WarningTypeEnum.NO_DURATION_RECORD,
              additionalLabel: lines[index],
            });
          }

          // Extract the name from the last non-link line of the record
          const nameMatch = lines[lastLineIndex - 1]?.match(/,([^,]+)$/);
          if (nameMatch && nameMatch.length > 1) {
            record.name = nameMatch[1].trim();
          } else {
            parsingResults.warnings.push({
              line: index,
              type: WarningTypeEnum.NO_NAME_RECORD,
              additionalLabel: lines[index],
            });
          }

          const attributes = blockContent.match(/([^=\s]+)="([^"]+)"/g);
          if (attributes) {
            attributes.forEach((attribute) => {
              const [key, value] = attribute.split("=");
              const trimmedKey = key.trim();
              const trimmedValue = value.replace(/"/g, "").trim();
              switch (trimmedKey) {
                case "group-title":
                  record.groupTitle = trimmedValue;
                  break;
                case "tvg-id":
                  if (!record.tvgParameters) record.tvgParameters = {};
                  record.tvgParameters.tvgId = trimmedValue;
                  break;
                case "tvg-logo":
                  if (!record.tvgParameters) record.tvgParameters = {};
                  record.tvgParameters.tvgLogo = trimmedValue;
                  break;
                case "tvg-name":
                  if (!record.tvgParameters) record.tvgParameters = {};
                  record.tvgParameters.tvgName = trimmedValue;
                  break;
              }
            });
          }

          const link = lines[lastLineIndex]?.trim();
          if (link) {
            let type = RecordTypeEnum.MEDIA;
            if (record.duration === -1) {
              type = /\.(mp4|mkv|avi|mpg|m4v|ts)$/i.test(link)
                ? RecordTypeEnum.VOD
                : RecordTypeEnum.LIVE;
            }
            record.link = link;
            record.type = type;
            parsedRecords.push(record);
          } else {
            parsingResults.warnings.push({
              line: index,
              type: WarningTypeEnum.NO_LINK_RECORD,
              additionalLabel: lines[lastLineIndex - 1],
            });
          }
        } else if (line.startsWith("#EXT-X")) {
          parsingResults.warnings.push({
            line: index,
            type: WarningTypeEnum.UNSUPPORTED_HLS_TAG,
            additionalLabel: lines[index],
          });
        } else if (startsWithAny(line, UNSUPPORTED_XM3U_TAG_LIST)) {
          parsingResults.warnings.push({
            line: index,
            type: WarningTypeEnum.UNSUPPORTED_XM3U_TAG,
            additionalLabel: lines[index],
          });
        } else if (line.startsWith("#") && !line.startsWith("#EXTM3U")) {
          parsingResults.warnings.push({
            line: index,
            type: WarningTypeEnum.UNKNOWN_TAG,
            additionalLabel: lines[index],
          });
        }

        const parsingProgress = Math.round(((index + 1) / totalLines) * 100);
        if (progressCallback) {
          const progressState: ParsingProcessState = {
            parsingState: ParsingStateEnum.PARSING,
            progress: parsingProgress,
          };
          progressCallback(progressState);
        }
      }

      if (index < totalLines) {
        setTimeout(processBatch, 0);
      } else {
        parsingResults.records = parsedRecords;
        resolve(parsingResults);
      }
    };

    processBatch();
  });
}

function downloadFileFromUrl(
  url: string,
  progressCallback: Function
): Promise<File> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        progressCallback(
          Math.round(percentComplete),
          ProgressStatusEnum.RUNNING
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const contentType = xhr.getResponseHeader("content-type");
        // Get file name
        const urlParts = url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        if (
          (contentType?.includes("application/x-mpegURL") ||
            contentType?.includes("audio/mpegurl")) &&
          (fileName.endsWith(".m3u") || fileName.endsWith(".m3u8"))
        ) {
          const blob = new Blob([xhr.response], { type: contentType });
          const file = new File([blob], fileName, { type: contentType });
          resolve(file);
        } else {
          progressCallback(
            "Error: Invalid file type or extension",
            ProgressStatusEnum.ERROR
          );
          reject(new Error("Invalid file type or extension"));
        }
      } else {
        progressCallback("Error: Download failed", ProgressStatusEnum.ERROR);
        reject(new Error("Download failed"));
      }
    };

    xhr.onerror = () => {
      progressCallback("Error: Download failed", ProgressStatusEnum.ERROR);
      reject(new Error("Download failed"));
    };

    xhr.send();
  });
}

async function getDemoFile(fileName: string): Promise<File> {
  try {
    const response = await fetch(`examples/${fileName}`);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: "application/x-mpegURL" });
    return file;
  } catch (error) {
    throw new Error(`Error fetching the file: ${error}`);
  }
}
function downloadM3uResults(records: Record[], filename: string) {
  let m3uContent = "#EXTM3U\n";

  records.forEach((record) => {
    m3uContent += `#EXTINF:${record.duration ?? -1} `;

    // Add optional attributes to the EXTINF line
    if (record.groupTitle) {
      m3uContent += `group-title="${record.groupTitle}" `;
    }
    if (record.tvgParameters?.tvgId) {
      m3uContent += `tvg-id="${record.tvgParameters.tvgId}" `;
    }
    if (record.tvgParameters?.tvgLogo) {
      m3uContent += `tvg-logo="${record.tvgParameters.tvgLogo}" `;
    }
    if (record.tvgParameters?.tvgName) {
      m3uContent += `tvg-name="${record.tvgParameters.tvgName}" `;
    }

    m3uContent += `,${record.name}\n${record.link}\n`;
  });

  // Create a Blob from the generated content
  const blob = new Blob([m3uContent], { type: "text/plain" });

  // Download the Blob as an M3U file
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = `${filename}.m3u`;
  link.click();
}

function startsWithAny(
  targetString: string,
  possibleStrings: string[]
): boolean {
  for (const str of possibleStrings) {
    if (targetString.startsWith(str)) {
      return true;
    }
  }
  return false;
}

export default {
  parseM3UFile,
  downloadM3uResults,
  getDemoFile,
  downloadFileFromUrl,
};

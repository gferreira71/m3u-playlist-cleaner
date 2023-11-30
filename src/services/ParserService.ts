import { ProcessStateEnum } from "@/views/UploadView.vue";

function parseM3U(m3uContent: string, progressCallback: any) {
  return new Promise((resolve, reject) => {
    const parsedRecords: any[] = [];
    const lines = m3uContent.split(/\r?\n/).filter(line => line.trim() !== '');
    const totalLines = lines.length;
    const batchSize = 1000;

    let index = 0;

    const processBatch = () => {
      const endIndex = Math.min(index + batchSize, totalLines);

      for (; index < endIndex; index++) {
        const line = lines[index];



        if (line.startsWith('#EXTINF:')) {
          let currentIndex = index + 1; // Start from the line after #EXTINF
          let blockContent = line; // Initialize with the current line
          const record = {};
    
          // Extracting all lines until the start of the next record or '#'
          while (currentIndex < totalLines && !lines[currentIndex].startsWith('#')) {
            blockContent += '\n' + lines[currentIndex];
            currentIndex++;
          }
          const lastLineIndex = currentIndex - 1;

          // 'blockContent' contains the complete record block across multiple lines
          // Parse parameters and extract necessary information from 'blockContent'
          const durationMatch = blockContent.match(/#EXTINF:(-?\d+)/);
          if (durationMatch && durationMatch.length > 1) {
            record.duration = parseInt(durationMatch[1]);
          }

          // Extract the name from the last non-link line of the record
          const nameMatch = lines[lastLineIndex - 1]?.match(/,([^,]+)$/);
          if (nameMatch && nameMatch.length > 1) {
            record.name = nameMatch[1].trim();
          }

          const attributes = blockContent.match(/([^=\s]+)="([^"]+)"/g);
          if (attributes) {
            attributes.forEach(attribute => {
              const [key, value] = attribute.split('=');
              // remove logo with data:image/jpeg;base64 format
              //if(!value.includes("data:image/jpeg;base64")) {
                const trimmedKey = key.trim();
                const trimmedValue = value.replace(/"/g, '').trim();
                record[trimmedKey] = trimmedValue;
              //}
            });
          }

          const link = lines[lastLineIndex]?.trim();
          if (link) {
            const type = /\.(mp4|mkv|avi|mpg|m4v|ts)$/i.test(link) ? 'VOD' : 'LIVE';
            record.link = link;
            record.type = type;
            parsedRecords.push(record);
          }
        }

        const parsingProgress = Math.round(((index + 1) / totalLines) * 100);
        if (progressCallback && typeof progressCallback === 'function') {
          progressCallback(parsingProgress, ProcessStateEnum.PARSING);
        }
      }

      if (index < totalLines) {
        setTimeout(processBatch, 0);
      } else {
        const groupedByType = parsedRecords.reduce((acc, record) => {
          const type = /\.(mp4|mkv|avi|mpg|m4v|ts)$/i.test(record.link) ? 'VOD' : 'LIVE';
          const existingType = acc.find(item => item.name === type);

          if (!existingType) {
            acc.push({ name: type, records: [record] });
          } else {
            existingType.records.push(record);
          }

          return acc;
        }, []);

        /* const groupedByGroupTitle = groupedByType.map(typeGroup => {
          const groupedByGroup = typeGroup.records.reduce((acc, record) => {
            const existingGroup = acc.find(item => item.group_name === record['group-title']);

            if (!existingGroup) {
              acc.push({ group_name: record['group-title'], records: [record] });
            } else {
              existingGroup.records.push(record);
            }

            return acc;
          }, []);

          typeGroup.records = groupedByGroup;
          return typeGroup;
        });
        resolve(groupedByGroupTitle);
        */

        resolve(groupedByType);
        //resolve(parsedRecords);
      }
    };

    processBatch();
  });
}

// TODO:add the right type to the callback function
function parseM3UFile(file: File, progressCallback: any) {
  return new Promise((resolve, reject) => {
    const chunkSize = 1024 * 512; // Adjusted chunk size (512KB)
    const fileSize = file.size;
    let offset = 0;
    let partialLine = ''; // Store the last incomplete line

    let parsedContent = '';

    const readChunk = async () => {
      const chunk = file.slice(offset, offset + chunkSize);
      const reader = new FileReader();

      reader.onload = async () => {
        const content = reader.result;
        let chunkContent = partialLine + content; // Append the previous incomplete line

        let lines = chunkContent.split(/\r?\n/);

        // Check if the chunk contains a partial record from the previous chunk
        if (!lines[0].startsWith('#EXTINF:')) {
          const lastLineIndex = lines.length - 1;
          partialLine = lines[lastLineIndex];
          chunkContent = lines.slice(0, lastLineIndex).join('\n');
          lines = lines.slice(0, lastLineIndex);
        } else {
          partialLine = '';
        }

        for (const line of lines) {
          parsedContent += line + '\n'; // Add the line to parsed content
        }

        offset += chunkSize;
        const progress = Math.min(Math.round((offset / fileSize) * 100), 100);

        if (progressCallback && typeof progressCallback === 'function') {
          progressCallback(progress, ProcessStateEnum.READING);
        }

        if (offset < fileSize) {
          await readChunk();
        } else {
          // Process the remaining partial line
          if (partialLine.trim() !== '') {
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

function downloadM3uResults(records: any[]) {
  let m3uContent = '#EXTM3U\n';

  records.forEach(record => {
    m3uContent += `#EXTINF:-1 `;

    // Add attributes to the EXTINF line
    for (const key in record) {
      if (key !== 'link' && key !== 'type' && key !== 'name') {
        m3uContent += `${key}="${record[key]}" `;
      }
    }
    m3uContent += `,${record.name}\n${record.link}\n`;
  });

  // Create a Blob from the generated content
  const blob = new Blob([m3uContent], { type: 'text/plain' });
  
  // Download the Blob as an M3U file
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'generated_playlist.m3u';
  link.click();
}

export default {parseM3UFile, downloadM3uResults}
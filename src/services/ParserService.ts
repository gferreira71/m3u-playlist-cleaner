export default function parseM3U(m3uContent) {
    const parsedRecords = [];
    const lines = m3uContent.split(/\r?\n/).filter(line => line.trim() !== '');
  
    for (const line of lines) {
      if (line.startsWith('#EXTINF:')) {
        const record = {};
        const attributes = line.match(/([^=\s]+)="([^"]+)"/g);
  
        if (attributes) {
          for (const attribute of attributes) {
            const [key, value] = attribute.split('=');
            const trimmedKey = key.trim();
            const trimmedValue = value.replace(/"/g, '').trim();
            record[trimmedKey] = trimmedValue;
          }
        }
  
        const link = lines[lines.indexOf(line) + 1].trim();
        record.link = link;
  
        parsedRecords.push(record);
      }
    }
  
    const groupedByType = parsedRecords.reduce((acc, record) => {
      const type = record.link.endsWith('.mp4') || record.link.endsWith('.mkv') ? 'VOD' : 'LIVE';
      const existingType = acc.find(item => item.name === type);
  
      if (!existingType) {
        acc.push({ name: type, records: [record] });
      } else {
        existingType.records.push(record);
      }
  
      return acc;
    }, []);
  
    const groupedByGroupTitle = groupedByType.map(typeGroup => {
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
  
    return groupedByGroupTitle;
  }
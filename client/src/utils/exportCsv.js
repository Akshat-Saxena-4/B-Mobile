const escapeCsvValue = (value) => {
  const stringValue = `${value ?? ''}`;

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const downloadCsv = ({ filename, columns, rows }) => {
  if (typeof window === 'undefined' || !columns?.length) {
    return;
  }

  const header = columns.map((column) => escapeCsvValue(column.label)).join(',');
  const body = rows.map((row) =>
    columns
      .map((column) => {
        const rawValue =
          typeof column.value === 'function' ? column.value(row) : row?.[column.key];
        return escapeCsvValue(rawValue);
      })
      .join(',')
  );

  const csv = [header, ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  window.URL.revokeObjectURL(url);
};


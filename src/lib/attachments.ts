import axios from 'axios';

const API = 'http://localhost:8080/api';

export async function uploadAttachments(
  resourceType: string,
  resourceId: number,
  files: File[],
  headers: Record<string, string>
) {
  if (files.length === 0) return;
  const data = new FormData();
  files.forEach((file) => data.append('files', file));
  await axios.post(`${API}/attachments/${resourceType}/${resourceId}`, data, { headers });
}

export function responseRecordId(response: any): number {
  return Number(
    response?.data?.data?.ID ?? response?.data?.data?.id ??
    response?.data?.ID ?? response?.data?.id ?? 0
  );
}

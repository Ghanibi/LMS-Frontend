import axios from 'axios';

export async function downloadProtectedFile(fileUrl: string, fileName: string) {
  const url = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8080${fileUrl}`;
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    responseType: 'blob',
  });
  const objectUrl = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName || 'lampiran';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

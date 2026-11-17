import axios from 'axios';

export async function downloadProtectedFile(fileUrl: string, fileName: string) {
  const response = await axios.get(fileUrl, {
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

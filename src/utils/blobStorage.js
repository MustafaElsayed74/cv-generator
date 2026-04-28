import { put, list } from '@vercel/blob';

const getOptions = () => ({
  token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN,
});

export const saveCV = async (username, cvData) => {
  if (!username) throw new Error("Username is required to save CV.");
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `cv_history/${username}/cv_${timestamp}.json`;
  
  const blob = new Blob([JSON.stringify(cvData, null, 2)], { type: 'application/json' });
  
  const result = await put(filename, blob, {
    access: 'public',
    ...getOptions()
  });
  
  return result;
};

export const getHistory = async (username) => {
  if (!username) return [];
  
  const result = await list({
    prefix: `cv_history/${username}/`,
    ...getOptions()
  });
  
  // Sort by uploadedAt descending (newest first)
  return result.blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

export const loadCV = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to load CV data");
  return await response.json();
};

export const saveCV = async (username, cvData) => {
  if (!username) throw new Error("Username is required to save CV.");
  
  const response = await fetch('/api/blob', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, data: cvData })
  });
  
  if (!response.ok) {
     const errorBody = await response.json().catch(() => ({}));
     throw new Error(errorBody.error || "Failed to save CV data to cloud");
  }
  
  return response.json();
};

export const getHistory = async (username) => {
  if (!username) return [];
  
  const response = await fetch(`/api/blob?username=${encodeURIComponent(username)}`);
  
  if (!response.ok) {
     const errorBody = await response.json().catch(() => ({}));
     throw new Error(errorBody.error || "Failed to load CV history");
  }
  
  const result = await response.json();
  
  // Sort by uploadedAt descending (newest first)
  return result.blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
};

export const loadCV = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to download CV file from storage");
  return await response.json();
};

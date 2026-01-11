// Placeholder for production cloud sync
// In real environments, this should be swapped for secure API endpoints (e.g., REST, GraphQL)

export type CloudDoc = {
  id: string;
  content: string;
  updated: number;
};

const LOCAL_CLOUD_KEY = "cloud-doc-1";

export async function saveToCloud(content: string) {
  // Replace this with actual API POST
  const payload: CloudDoc = {
    id: "doc-1",
    content,
    updated: Date.now(),
  };
  localStorage.setItem(LOCAL_CLOUD_KEY, JSON.stringify(payload));
  return payload;
}

export async function fetchFromCloud(): Promise<CloudDoc|null> {
  // Replace with GET request for real backend
  const raw = localStorage.getItem(LOCAL_CLOUD_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

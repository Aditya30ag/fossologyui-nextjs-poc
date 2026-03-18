import { apiClient } from './axios';

// TypeScript interfaces ensuring type safety with the existing FOSSology Backend API
export interface Folder {
  id: number;
  name: string;
  description: string;
  parent: number;
}

export interface UploadResponse {
  code: number;
  message: string;
  uploadId?: number;
}

/**
 * Proof of Concept: folderService.ts
 * Demonstrates how to abstract the existing FOSSology backend REST APIs 
 * into clean, typed, and reusable functions for the Next.js frontend.
 */
export const folderService = {
  // GET: Fetch all folders
  getFolders: async (): Promise<Folder[]> => {
    const response = await apiClient.get<Folder[]>('/api/v1/folders');
    return response.data;
  },

  // GET: Fetch a single folder by ID
  getFolderById: async (id: number): Promise<Folder> => {
    const response = await apiClient.get<Folder>(`/api/v1/folders/${id}`);
    return response.data;
  },

  // POST: Create a new folder
  createFolder: async (name: string, description: string, parentId: number): Promise<Folder> => {
    const response = await apiClient.post<Folder>('/api/v1/folders', {
      name,
      description,
      parent: parentId
    });
    return response.data;
  },

  // DELETE: Delete a folder
  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/folders/${id}`);
  }
};

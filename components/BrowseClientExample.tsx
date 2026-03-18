import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axios';

// Simplified Hook for data fetching using TanStack Query
const useBrowseData = (folderId: string) => {
  return useQuery({
    queryKey: ['browseData', folderId],
    queryFn: async () => {
      const response = await apiClient.get(`/folders/${folderId}`);
      return response.data;
    },
    // We can handle staleTime, caching, and retry logic centrally
    staleTime: 5 * 60 * 1000, 
  });
};

export const BrowseClientExample: React.FC<{ folderId: string }> = ({ folderId }) => {
  // TanStack Query entirely replaces the dozens of manual useState hooks for loading, error, and data variables
  const { data: folderList, isLoading, error } = useBrowseData(folderId);

  if (isLoading) {
    return <div>Loading folders... (Skeleton can go here)</div>;
  }

  if (error) {
    return <div>Error loading data: {(error as Error).message}</div>;
  }

  return (
    <div className="p-4 border rounded-md shadow-sm">
      <h2 className="text-xl font-bold mb-4">Folder Structure (Id: {folderId})</h2>
      
      {folderList?.length === 0 ? (
        <p>No folders to display.</p>
      ) : (
        <ul className="space-y-2">
          {folderList.map((folder: any) => (
            <li key={folder.id} className="p-2 bg-gray-50 rounded border">
              📄 {folder.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

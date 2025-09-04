// src/lib/azure/config.ts
import { BlobServiceClient } from '@azure/storage-blob';

/**
 * @deprecated This file is currently disabled in favor of Supabase storage
 */
export const azureStorageConfig = {
  isDisabled: true,
  accountName: '',
  sasToken: '',
  containerName: 'uploads'
};

// Mock implementation of blob service client
const mockBlobServiceClient = {
  getContainerClient: () => ({
    getBlockBlobClient: () => ({
      uploadData: async () => {
        console.warn('⚠️ Azure Storage is disabled. Using Supabase storage instead.');
        return Promise.reject('Azure Storage is disabled - Use Supabase storage');
      }
    })
  })
};

export const blobServiceClient = mockBlobServiceClient;
export const getContainerClient = () => mockBlobServiceClient.getContainerClient();

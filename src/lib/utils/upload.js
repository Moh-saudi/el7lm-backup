// src/lib/utils/upload.js
import { BlobServiceClient } from '@azure/storage-blob';

export async function uploadFileToAzure(file) {
  try {
    // التحقق من وجود المتغيرات البيئية
    const { accountName, sasToken, containerName } = AZURE_CONFIG;


    if (!accountName || !sasToken || !containerName) {
      throw new Error('Azure storage configuration is missing');
    }

    // إنشاء عميل Azure Blob
    const blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net/?${sasToken}`
    );

    // الحصول على عميل الحاوية
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // إنشاء اسم فريد للملف
    const blobName = `${Date.now()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // رفع الملف
    await blockBlobClient.uploadData(file);

    // إرجاع رابط الملف
    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure:', error);
    return null;
  }
}
  
    
  
  

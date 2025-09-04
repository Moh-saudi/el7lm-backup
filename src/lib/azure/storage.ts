// src/lib/azure/storage.ts
import { BlobServiceClient } from '@azure/storage-blob';

export async function uploadFile(file: File) {
    try {
        // التحقق من وجود المتغيرات البيئية
        const connectionString = process.env.NEXT_PUBLIC_AZURE_CONNECTION_STRING;
        const containerName = process.env.NEXT_PUBLIC_AZURE_CONTAINER_NAME;

        if (!connectionString || !containerName) {
            throw new Error('Azure configuration missing');
        }

        // إنشاء عميل Azure
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
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
        throw error;
    }
}

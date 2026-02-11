import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
    private storage: Storage;
    private bucketName: string;

    constructor() {
        // Use Application Default Credentials (ADC)
        // For local testing: gcloud auth application-default login
        this.storage = new Storage();
        this.bucketName = process.env.GCS_BUCKET_NAME || 'store-resume';
    }

    /**
     * Upload a file to Google Cloud Storage
     * @param file - The file buffer to upload
     * @param originalName - Original filename
     * @returns Public URL of the uploaded file
     */
    async uploadFile(file: Buffer, originalName: string): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);

        // Generate unique filename to avoid collisions
        const fileExtension = originalName.split('.').pop();
        const fileName = `resumes/${uuidv4()}.${fileExtension}`;

        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: this.getContentType(fileExtension),
            },
        });

        return new Promise((resolve, reject) => {
            blobStream.on('error', (error) => {
                reject(error);
            });

            blobStream.on('finish', async () => {
                // Return the public URL
                // Note: For public access, configure bucket-level permissions in GCP Console
                const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
                resolve(publicUrl);
            });

            blobStream.end(file);
        });
    }

    /**
     * Get content type based on file extension
     */
    private getContentType(extension: string | undefined): string {
        const contentTypes: { [key: string]: string } = {
            pdf: 'application/pdf',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            txt: 'text/plain',
        };
        return contentTypes[extension?.toLowerCase() || ''] || 'application/octet-stream';
    }
}

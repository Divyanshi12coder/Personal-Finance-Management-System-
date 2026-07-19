export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export interface IStorageProvider {
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>; // returns public/accessible URL
}

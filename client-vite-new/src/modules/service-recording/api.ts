import ajax from '../../utils/ajax';
import { apiBaseUrl } from '../../data/constants';
import type { BulkUploadSummary } from './types';
export const serviceRecordingApi = {
  bulkUploadGuests: (file: File): Promise<BulkUploadSummary> => {
    const form = new FormData();
    form.append('file', file);
    return ajax.post(`${apiBaseUrl}/api/service-recording/guests/bulk`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  bulkUploadBelievers: (file: File): Promise<BulkUploadSummary> => {
    const form = new FormData();
    form.append('file', file);
    return ajax.post(`${apiBaseUrl}/api/service-recording/believers/bulk`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};

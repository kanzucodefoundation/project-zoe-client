export interface BulkRowResult {
  row: number;
  name: string;
  status: 'created' | 'linked' | 'error';
  error?: string;
}

export  interface BulkUploadSummary {
  total: number;
  created: number;
  linked: number;
  errors: BulkRowResult[];
}

export const AccountType = {
  BANK: 'BANK',
  MOBILE_MONEY: 'MOBILE_MONEY',
  CASH: 'CASH',
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const TransactionStatus = {
  PENDING: 'PENDING',
  RECONCILED: 'RECONCILED',
  DISPUTED: 'DISPUTED',
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const TransactionCategory = {
  TITHE: 'TITHE',
  OFFERING: 'OFFERING',
  DONATION: 'DONATION',
  ARISE_BUILD: 'ARISE_BUILD',
} as const;
export type TransactionCategory = (typeof TransactionCategory)[keyof typeof TransactionCategory];

export const MatchType = {
  AUTO: 'AUTO',
  MANUAL: 'MANUAL',
  SUGGESTED: 'SUGGESTED',
} as const;
export type MatchType = (typeof MatchType)[keyof typeof MatchType];

export const MatchStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const BatchStatus = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  EXECUTED: 'EXECUTED',
} as const;
export type BatchStatus = (typeof BatchStatus)[keyof typeof BatchStatus];

export interface FinancialAccount {
  id: number;
  tenantId: number;
  name: string;
  accountNumber: string;
  type: AccountType;
  ownerGroup?: {
    id: number;
    name: string;
  };
  ownerGroupId?: number | null;
  metadata?: {
    bankName?: string;
    provider?: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: number;
  tenantId: number;
  account: FinancialAccount;
  accountId: number;
  transactionDate: string;
  amount: number;
  externalReference?: string;
  senderName?: string;
  senderPhone?: string;
  senderAccountNumber?: string;
  narration?: string;
  status: TransactionStatus;
  category?: TransactionCategory;
  importedAt: string;
  metadata?: {
    manualCategory?: TransactionCategory;
    rawData?: Record<string, unknown>;
  };
  reconciliationMatch?: ReconciliationMatch;
}

export interface MatchSuggestion {
  contact: {
    id: number;
    name: string;
    phone?: string;
    location?: string;
  };
  confidenceScore: number;
  matchReasons: string[];
}

export interface ReconciliationMatch {
  id: number;
  tenantId: number;
  transaction: Transaction;
  transactionId: number;
  contact?: {
    id: number;
    name: string;
  };
  contactId?: number;
  location?: {
    id: number;
    name: string;
  };
  locationId?: number;
  matchType: MatchType;
  confidenceScore?: number;
  matchReasons?: string[];
  status: MatchStatus;
  reviewedBy?: {
    id: number;
    name: string;
  };
  reviewedAt?: string;
  createdAt: string;
}

export interface DistributionBatch {
  id: number;
  tenantId: number;
  name: string;
  periodStart: string;
  periodEnd: string;
  status: BatchStatus;
  distributions: Distribution[];
  totalAmount: number;
  createdBy?: {
    id: number;
    name: string;
  };
  createdAt: string;
  approvedBy?: {
    id: number;
    name: string;
  };
  approvedAt?: string;
}

export interface Distribution {
  id: number;
  batch?: DistributionBatch;
  batchId: number;
  sourceMatchId?: number;
  category: TransactionCategory;
  fromAccount?: FinancialAccount;
  fromAccountId?: number;
  toAccount?: FinancialAccount;
  toAccountId?: number;
  toLocation?: {
    id: number;
    name: string;
  };
  toLocationId?: number;
  amount: number;
  percentage?: number;
  purpose: string;
  transferred: boolean;
  transferredAt?: string;
  transferReference?: string;
  metadata?: Record<string, unknown>;
}

export interface CategoryRule {
  id: number;
  tenantId: number;
  name: string;
  category: TransactionCategory;
  conditions: CategoryRuleConditions;
  priority: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryRuleConditions {
  accounts?: number[];
  keywords?: string[];
  dateRange?: { start: string; end: string };
  timeRange?: { start: string; end: string };
  daysOfWeek?: number[];
  applyEveryYear?: boolean;
}

export interface ContactPaymentMethod {
  id: number;
  contactId: number;
  type: 'PHONE' | 'BANK_ACCOUNT';
  value: string;
  provider?: string;
  isActive: boolean;
  addedAt: string;
  lastVerifiedAt?: string;
  transactionCount: number;
}

// Form types
export interface FinancialAccountFormData {
  name: string;
  accountNumber: string;
  type: AccountType;
  ownerGroupId: number | null;
  bankName?: string;
  provider?: string;
  isActive: boolean;
}

export interface TransactionImportConfig {
  accountId: number;
  defaultCategory: TransactionCategory;
  applyServiceTimeRules: boolean;
}

export interface ParsedTransaction {
  rowIndex: number;
  transactionDate: string;
  amount: number;
  senderName?: string;
  senderPhone?: string;
  narration?: string;
  category: TransactionCategory;
  isValid: boolean;
  errors?: string[];
}

export interface DistributionCalculationRequest {
  name: string;
  periodStart: string;
  periodEnd: string;
  includeApprovedOnly: boolean;
}

// Report types
export interface ReconciliationSummary {
  totalImported: number;
  totalMatched: number;
  totalPending: number;
  totalDisputed: number;
  matchRate: number;
  byCategory: Record<TransactionCategory, number>;
}

export interface DistributionSummary {
  totalDistributed: number;
  byCategory: Record<TransactionCategory, {
    total: number;
    distributions: {
      purpose: string;
      percentage: number;
      amount: number;
    }[];
  }>;
  byLocation: Record<string, number>;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

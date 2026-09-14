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
  /** Set once this transaction has reached QuickBooks successfully. */
  accountingPosting?: AccountingPosting | null;
}

export interface AccountingPosting {
  id: number;
  status: 'POSTED' | 'FAILED' | 'PENDING';
  externalDocumentId: string | null;
  externalDocumentNumber: string | null;
  postedAt?: string | null;
}

export interface MatchSuggestion {
  contact: {
    id: number;
    name: string;
    phone?: string;
    /** Campus the gift will be attributed to. */
    location?: string;
    /** FOB above that campus — the QuickBooks class the gift posts against. */
    fob?: string;
    /** True when both fell back to the mother group. */
    attributionIsFallback?: boolean;
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
  /**
   * Only populated by the batch-detail endpoint. The list endpoint omits it
   * and returns `distributionCount` instead, so `undefined` here means "not
   * loaded", never "none".
   */
  distributions?: Distribution[];
  /** Line count, returned by the list endpoint. */
  distributionCount?: number;
  /** Postgres numeric arrives as a string; coerce before formatting. */
  totalAmount: number | string;
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
  /** Where the money goes — an account or a group, per the server entity. */
  targetAccount?: FinancialAccount;
  targetGroup?: {
    id: number;
    name: string;
  };
  amount: number | string;
  percentage?: number | string;
  /** Free-text purpose from the distribution rule. */
  description?: string;
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
  /** QuickBooks item to fall back to when a message names none. */
  defaultItemId?: string | null;
  defaultItemName?: string | null;
  applyServiceTimeRules: boolean;
}

export interface ParsedTransaction {
  rowIndex: number;
  transactionDate: string;
  amount: number;
  externalReference?: string | null;
  senderName?: string;
  senderPhone?: string;
  /** The statement's free-text box — MoMo's "To message". */
  narration?: string;
  category: TransactionCategory;
  /** Why this row got its category: the rule that fired, or the default. */
  matchedRule?: string;
  /** Tithe number read out of the statement message, e.g. TBGB0095. */
  titheNumber?: string | null;
  /** QuickBooks product/service this row will post against. */
  externalItemId?: string | null;
  externalItemName?: string | null;
  isValid: boolean;
  errors?: string[];
}

/** One account from the QuickBooks chart of accounts. */
export interface QboAccountOption {
  id: string;
  name: string;
  accountType: string | null;
  currency: string | null;
  /** Set when a Zoe account is already linked to this QuickBooks account. */
  linkedAccountId: number | null;
  linkedAccountName: string | null;
}

/** A giving category paired with the QuickBooks item it posts to. */
export interface GivingCategoryOption {
  category: TransactionCategory | null;
  label: string;
  internalLabel: string | null;
  qboItemId: string | null;
  qboItemName: string | null;
  /** False for a QuickBooks item with no Zoe category behind it. */
  selectable: boolean;
  isDefault: boolean;
}

export interface DistributionCalculationRequest {
  name: string;
  periodStart: string;
  periodEnd: string;
  includeApprovedOnly: boolean;
}

// Report types
export interface ReconciliationSummary {
  totalTransactions: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  reconciledCount: number;
  reconciledAmount: number;
  disputedCount: number;
  disputedAmount: number;
  /** Already a percentage (0-100), not a fraction. */
  matchRate: number;
  byCategory: {
    category: string;
    count: number;
    amount: number;
  }[];
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

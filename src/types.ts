export type ViolationLevel = '極嚴重' | '重大' | '一般' | '輕微';

export interface ViolationType {
  id: string;
  name: string;
  level: ViolationLevel;
  description: string;
}

export interface Company {
  id: string;
  name: string;
  taxId?: string;
  businessType?: string;
}

export interface AppealInfo {
  fileUrl?: string;
  fileName?: string;
  explanation?: string;
}

export interface Attachment {
  name: string;
  data: string;
  type: string;
}

export interface AppealRecord {
  id: string;
  violationId: string;
  date: string;
  description: string;
  attachments: Attachment[];
  createdAt: unknown;
}

export interface ViolationRecord {
  id: string;
  companyId: string;
  violationTypeId?: string;
  violationTypeName: string;
  level: ViolationLevel;
  date: string; // YYYY-MM-DD
  year: number;
  docNumber?: string;
  description?: string;
  points: number;
  isCancelled: boolean;
  cancelReason?: string;
  isAppealFinished?: boolean;
  attachments?: Attachment[];
  createdAt: unknown; // Firestore Timestamp
}

export interface SuspensionRecord {
  id: string;
  companyId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  note?: string;
  createdAt: unknown;
}

export interface CloudLink {
  id: string;
  name: string;
  url: string;
  note?: string;
  createdAt: unknown;
}

export interface CompanyStats {
  company: Company;
  violations: ViolationRecord[];
  totalPoints: number;
  activeSuspension?: SuspensionRecord;
  isAtThreshold: boolean;
}

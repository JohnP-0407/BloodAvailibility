export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type BloodComponent = 'WHOLE_BLOOD' | 'PRBC' | 'PLATELETS' | 'FFP' | 'CRYOPRECIPITATE';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';

/**
 * Standardized Request Status - Defined in MASTER_SPEC.md.
 * The frontend must NOT invent new status names.
 */
export type RequestStatus = 
  | 'CREATED'
  | 'SEARCHING'
  | 'MATCHED'
  | 'PENDING_CONFIRMATION'
  | 'ACCEPTED'
  | 'RESERVED'
  | 'FULFILLED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type UserRole = 'PATIENT' | 'HOSPITAL' | 'BLOOD_BANK_STAFF' | 'DONOR' | 'ADMIN';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface InventoryItem {
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsAvailable: number;
  unitsReserved: number;
  criticalThreshold: number;
  expiryWithinDays: number;
  lastUpdated?: string;
  status?: 'AVAILABLE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE';
}

export interface BloodBank {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  contactNumber: string;
  operatingHours: string;
  location: Coordinates;
  inventory: Record<string, InventoryItem>; // key: `${bloodGroup}_${component}`
  verified: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  contactNumber: string;
  location: Coordinates;
  traumaCenterLevel: 1 | 2 | 3;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  donorName?: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsDonated: number;
  donationDate: string; // ISO date
  facilityName: string;
  facilityType: 'BLOOD_BANK' | 'HOSPITAL';
  facilityId?: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'DEFERRED';
  vitals?: {
    hemoglobinGdl?: number;
    bloodPressure?: string;
    pulseBpm?: number;
    weightKg?: number;
  };
  certificateId?: string;
  notes?: string;
}

export interface Donor {
  id: string;
  name: string;
  code: string;
  bloodGroup: BloodGroup;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  weightKg: number;
  contactNumber: string;
  city: string;
  location: Coordinates;
  lastDonationDate: string; // ISO date or empty string if first-time
  totalDonations: number;
  isEligible: boolean;
  status: 'AVAILABLE' | 'ON_CALL' | 'COOLDOWN' | 'INELIGIBLE';
  availability?: 'AVAILABLE' | 'UNAVAILABLE';
  badges: string[];
  donationHistory?: DonationRecord[];
  email?: string;
  preferredHospitalId?: string;
}

export interface MatchStep {
  stage: 'INVENTORY_EXACT' | 'INVENTORY_COMPATIBLE' | 'PARTNER_BANKS' | 'DONOR_DISPATCH';
  sourceId: string;
  sourceName: string;
  sourceType: 'BLOOD_BANK' | 'DONOR';
  bloodGroupOffered: BloodGroup;
  unitsAllocated: number;
  distanceKm: number;
  status: 'CONFIRMED' | 'PENDING' | 'RESERVED';
}

export interface ContactInformation {
  contactPerson: string;
  phoneNumber: string;
  email?: string;
  relationship?: string;
}

export interface RequestLocation {
  hospitalName: string;
  address: string;
  lat: number;
  lng: number;
}

export interface BloodRequest {
  id: string;
  requestNumber: string;
  patientName: string; // Synthetic e.g. "Demo Patient 104"
  patientId: string;
  hospitalId: string;
  hospitalName: string;
  requesterRole: 'PATIENT' | 'HOSPITAL';
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsRequired: number; // Official field
  unitsNeeded: number;   // Backward compatibility alias
  unitsAllocated: number;
  urgency: UrgencyLevel;
  requiredDateTime: string; // ISO string
  location: Coordinates | RequestLocation;
  contactInformation: ContactInformation;
  clinicalReason: string;
  additionalNotes?: string;
  notes?: string;
  city: string;
  status: RequestStatus;
  createdAt: string; // ISO
  estimatedArrivalMin?: number;
  matchedSources: MatchStep[];
  donorAlertsSent?: number;
  donorAlertsAccepted?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: UserRole;
  details: string;
  requestId?: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  requestId?: string;
  read: boolean;
}

export interface CompatibilityInfo {
  canReceiveFrom: BloodGroup[];
  canDonateTo: BloodGroup[];
  isUniversalDonorRbc: boolean;
  isUniversalRecipientRbc: boolean;
  isUniversalDonorPlasma: boolean;
  isUniversalRecipientPlasma: boolean;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  registeredAt: string;
  lastActive: string;
  associatedFacility?: string;
  bloodGroup?: BloodGroup;
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
  phone?: string;
}

export type ShortageStatus = 'NORMAL' | 'ATTENTION' | 'POTENTIAL_SHORTAGE';

export interface BloodGroupShortageInfo {
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  unitsDemandedRecent: number;
  burnRatePerDay: number;
  bufferDays: number;
  status: ShortageStatus;
  statusReason: string;
  recommendedAction: string;
}

export interface ShortageReport {
  timestamp: string;
  overallStatus: ShortageStatus;
  criticalGroups: BloodGroup[];
  attentionGroups: BloodGroup[];
  normalGroups: BloodGroup[];
  groups: Record<BloodGroup, BloodGroupShortageInfo>;
  calculationMethod: string;
}

export interface DemandAnalytics {
  totalRequests: number;
  fulfilledRequests: number;
  fulfillmentRate: number;
  requestsByBloodGroup: Record<BloodGroup, number>;
  requestsByUrgency: Record<UrgencyLevel, number>;
  requestsByMonth: Array<{ month: string; count: number; fulfilled: number }>;
  requestsByWeek: Array<{ week: string; count: number; critical: number }>;
  demandTrend: 'INCREASING' | 'STABLE' | 'DECREASING';
}

export interface InventoryAnalytics {
  totalAvailableUnits: number;
  totalReservedUnits: number;
  inventoryByBloodGroup: Record<BloodGroup, number>;
  inventoryByComponent: Record<BloodComponent, number>;
  criticalStockGroups: BloodGroup[];
  bankStockSummaries: Array<{
    id: string;
    name: string;
    code: string;
    totalUnits: number;
    criticalCount: number;
    verified: boolean;
  }>;
}


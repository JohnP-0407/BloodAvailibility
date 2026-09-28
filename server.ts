import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store initialized with demo requests for prototype
let bloodRequestsDb: any[] = [
  {
    id: 'req-101',
    requestNumber: 'REQ-2026-0928-101',
    patientName: 'Demo Patient 101',
    patientId: 'DP-101',
    hospitalId: 'hosp-01',
    hospitalName: 'Demo Hospital 01 - City Emergency Trauma Center',
    requesterRole: 'HOSPITAL',
    bloodGroup: 'O-',
    component: 'PRBC',
    unitsRequired: 3,
    unitsNeeded: 3,
    unitsAllocated: 3,
    urgency: 'CRITICAL',
    requiredDateTime: '2026-09-28T09:30:00.000Z',
    location: {
      hospitalName: 'Demo Hospital 01 - City Emergency Trauma Center',
      address: '1001 Potrero Ave, San Francisco',
      lat: 37.7558,
      lng: -122.4045
    },
    contactInformation: {
      contactPerson: 'Dr. Sarah Adams',
      phoneNumber: '+1 (555) 012-7001',
      email: 's.adams@demohospital01.org',
      relationship: 'Lead Trauma Surgeon'
    },
    clinicalReason: 'Massive acute hemorrhage from vehicular collision, acute hypovolemic shock',
    additionalNotes: 'Code Red protocol triggered. Cold chain medical courier vehicle in transit.',
    notes: 'Code Red protocol triggered. Cold chain medical courier vehicle in transit.',
    city: 'San Francisco',
    status: 'ACCEPTED',
    createdAt: '2026-09-28T07:12:00.000Z',
    estimatedArrivalMin: 14,
    matchedSources: [
      {
        stage: 'INVENTORY_EXACT',
        sourceId: 'bb-01',
        sourceName: 'Demo Blood Bank 01 - Metro Central',
        sourceType: 'BLOOD_BANK',
        bloodGroupOffered: 'O-',
        unitsAllocated: 2,
        distanceKm: 2.8,
        status: 'CONFIRMED'
      },
      {
        stage: 'INVENTORY_EXACT',
        sourceId: 'bb-02',
        sourceName: 'Demo Blood Bank 02 - City Trauma Regional',
        sourceType: 'BLOOD_BANK',
        bloodGroupOffered: 'O-',
        unitsAllocated: 1,
        distanceKm: 2.5,
        status: 'CONFIRMED'
      }
    ],
    donorAlertsSent: 0,
    donorAlertsAccepted: 0
  },
  {
    id: 'req-102',
    requestNumber: 'REQ-2026-0928-102',
    patientName: 'Demo Patient 102',
    patientId: 'DP-102',
    hospitalId: 'hosp-02',
    hospitalName: 'Demo Hospital 02 - St. Jude Memorial Hospital',
    requesterRole: 'HOSPITAL',
    bloodGroup: 'A+',
    component: 'PLATELETS',
    unitsRequired: 4,
    unitsNeeded: 4,
    unitsAllocated: 4,
    urgency: 'HIGH',
    requiredDateTime: '2026-09-28T14:00:00.000Z',
    location: {
      hospitalName: 'Demo Hospital 02 - St. Jude Memorial Hospital',
      address: '350 Parnassus Ave, San Francisco',
      lat: 37.7634,
      lng: -122.4582
    },
    contactInformation: {
      contactPerson: 'Dr. Michael Chen',
      phoneNumber: '+1 (555) 012-7002',
      email: 'm.chen@stjudememorial.org',
      relationship: 'Hematology Ward Supervisor'
    },
    clinicalReason: 'Severe thrombocytopenia secondary to post-induction chemotherapy',
    additionalNotes: 'Requires single donor platelets / irradiated if possible.',
    notes: 'Requires single donor platelets / irradiated if possible.',
    city: 'San Francisco',
    status: 'RESERVED',
    createdAt: '2026-09-28T06:45:00.000Z',
    estimatedArrivalMin: 28,
    matchedSources: [
      {
        stage: 'INVENTORY_EXACT',
        sourceId: 'bb-01',
        sourceName: 'Demo Blood Bank 01 - Metro Central',
        sourceType: 'BLOOD_BANK',
        bloodGroupOffered: 'A+',
        unitsAllocated: 3,
        distanceKm: 3.9,
        status: 'RESERVED'
      },
      {
        stage: 'INVENTORY_COMPATIBLE',
        sourceId: 'bb-03',
        sourceName: 'Demo Blood Bank 03 - RedCross Life Center',
        sourceType: 'BLOOD_BANK',
        bloodGroupOffered: 'A-',
        unitsAllocated: 1,
        distanceKm: 4.8,
        status: 'RESERVED'
      }
    ],
    donorAlertsSent: 0,
    donorAlertsAccepted: 0
  },
  {
    id: 'req-103',
    requestNumber: 'REQ-2026-0928-103',
    patientName: 'Demo Patient 103',
    patientId: 'DP-103',
    hospitalId: 'hosp-03',
    hospitalName: 'Demo Hospital 03 - Apex Metropolitan General',
    requesterRole: 'PATIENT',
    bloodGroup: 'B+',
    component: 'WHOLE_BLOOD',
    unitsRequired: 2,
    unitsNeeded: 2,
    unitsAllocated: 2,
    urgency: 'MEDIUM',
    requiredDateTime: '2026-09-29T10:00:00.000Z',
    location: {
      hospitalName: 'Demo Hospital 03 - Apex Metropolitan General',
      address: '900 Hyde Street, San Francisco',
      lat: 37.7891,
      lng: -122.4168
    },
    contactInformation: {
      contactPerson: 'Elena Rostova',
      phoneNumber: '+1 (555) 019-9941',
      email: 'elena.rostova@example.com',
      relationship: 'Patient Sibling'
    },
    clinicalReason: 'Elective scheduled orthopedic reconstructive procedure',
    additionalNotes: 'Scheduled joint replacement OR #2',
    notes: 'Scheduled joint replacement OR #2',
    city: 'San Francisco',
    status: 'FULFILLED',
    createdAt: '2026-09-28T05:10:00.000Z',
    matchedSources: [
      {
        stage: 'INVENTORY_EXACT',
        sourceId: 'bb-01',
        sourceName: 'Demo Blood Bank 01 - Metro Central',
        sourceType: 'BLOOD_BANK',
        bloodGroupOffered: 'B+',
        unitsAllocated: 2,
        distanceKm: 1.1,
        status: 'CONFIRMED'
      }
    ],
    donorAlertsSent: 0,
    donorAlertsAccepted: 0
  },
  {
    id: 'req-104',
    requestNumber: 'REQ-2026-0928-104',
    patientName: 'Demo Patient 104',
    patientId: 'DP-104',
    hospitalId: 'hosp-04',
    hospitalName: 'Demo Hospital 04 - Westside Pediatric & Surgical Center',
    requesterRole: 'PATIENT',
    bloodGroup: 'O+',
    component: 'PRBC',
    unitsRequired: 2,
    unitsNeeded: 2,
    unitsAllocated: 0,
    urgency: 'HIGH',
    requiredDateTime: '2026-09-28T18:00:00.000Z',
    location: {
      hospitalName: 'Demo Hospital 04 - Westside Pediatric & Surgical Center',
      address: '1600 Divisadero St, San Francisco',
      lat: 37.7845,
      lng: -122.4402
    },
    contactInformation: {
      contactPerson: 'David Miller',
      phoneNumber: '+1 (555) 018-4422',
      email: 'david.miller@example.com',
      relationship: 'Father'
    },
    clinicalReason: 'Pediatric sickle cell crisis with acute chest syndrome',
    additionalNotes: 'Phenotype-matched PRBC preferred',
    notes: 'Phenotype-matched PRBC preferred',
    city: 'San Francisco',
    status: 'SEARCHING',
    createdAt: '2026-09-28T07:35:00.000Z',
    matchedSources: [],
    donorAlertsSent: 2,
    donorAlertsAccepted: 0
  }
];

// Helper to compute inventory status
function computeStockStatus(unitsAvailable: number, criticalThreshold: number): 'AVAILABLE' | 'LOW' | 'CRITICAL' | 'UNAVAILABLE' {
  if (unitsAvailable <= 0) return 'UNAVAILABLE';
  if (unitsAvailable <= criticalThreshold) return 'CRITICAL';
  if (unitsAvailable <= Math.round(criticalThreshold * 1.5)) return 'LOW';
  return 'AVAILABLE';
}

function generateServerInventory(multiplier: number = 1): Record<string, any> {
  const inventory: Record<string, any> = {};
  const baseCounts: Record<string, number> = {
    'O+': 24,
    'O-': 6,
    'A+': 20,
    'A-': 8,
    'B+': 18,
    'B-': 7,
    'AB+': 12,
    'AB-': 4
  };
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = ['PRBC', 'WHOLE_BLOOD', 'PLATELETS', 'FFP', 'CRYOPRECIPITATE'];
  const defaultUpdated = '2026-09-28T07:00:00.000Z';

  bloodGroups.forEach(bg => {
    components.forEach(comp => {
      const key = `${bg}_${comp}`;
      const factor = comp === 'PRBC' ? 1.0 : comp === 'PLATELETS' ? 0.6 : comp === 'WHOLE_BLOOD' ? 0.8 : 0.5;
      const count = Math.max(1, Math.round(baseCounts[bg] * factor * multiplier));
      const threshold = comp === 'PRBC' ? 5 : 3;
      inventory[key] = {
        bloodGroup: bg,
        component: comp,
        unitsAvailable: count,
        unitsReserved: Math.floor(count * 0.15),
        criticalThreshold: threshold,
        expiryWithinDays: comp === 'PLATELETS' ? 4 : 28,
        lastUpdated: defaultUpdated,
        status: computeStockStatus(count, threshold)
      };
    });
  });

  return inventory;
}

let bloodBanksDb: any[] = [
  {
    id: 'bb-01',
    name: 'Demo Blood Bank 01 - Metro Central',
    code: 'DBB-01',
    address: '450 Healthcare Way, Suite 100',
    city: 'San Francisco',
    contactNumber: '+1 (555) 019-2831',
    operatingHours: '24/7 Emergency Operation',
    location: { lat: 37.7792, lng: -122.4184 },
    inventory: generateServerInventory(1.2),
    verified: true
  },
  {
    id: 'bb-02',
    name: 'Demo Blood Bank 02 - City Trauma Regional',
    code: 'DBB-02',
    address: '890 Mission Boulevard',
    city: 'San Francisco',
    contactNumber: '+1 (555) 019-4492',
    operatingHours: '24/7 Trauma Priority',
    location: { lat: 37.7651, lng: -122.4312 },
    inventory: generateServerInventory(0.9),
    verified: true
  },
  {
    id: 'bb-03',
    name: 'Demo Blood Bank 03 - RedCross Life Center',
    code: 'DBB-03',
    address: '1240 Bay Street',
    city: 'San Francisco',
    contactNumber: '+1 (555) 019-8733',
    operatingHours: '06:00 - 22:00 Daily',
    location: { lat: 37.8012, lng: -122.4285 },
    inventory: generateServerInventory(1.0),
    verified: true
  },
  {
    id: 'bb-04',
    name: 'Demo Blood Bank 04 - Suburban General Bank',
    code: 'DBB-04',
    address: '210 South Van Ness Ave',
    city: 'San Francisco',
    contactNumber: '+1 (555) 019-3381',
    operatingHours: '08:00 - 20:00 Daily',
    location: { lat: 37.7688, lng: -122.4095 },
    inventory: generateServerInventory(0.7),
    verified: true
  }
];

let donorsDb: any[] = [
  {
    id: 'donor-01',
    name: 'Demo Donor 001',
    code: 'DD-001',
    bloodGroup: 'O-',
    age: 29,
    gender: 'MALE',
    weightKg: 74,
    contactNumber: '+1 (555) 017-0001',
    city: 'San Francisco',
    location: { lat: 37.7725, lng: -122.4215 },
    lastDonationDate: '2026-06-15T10:00:00.000Z',
    totalDonations: 8,
    isEligible: true,
    status: 'AVAILABLE',
    availability: 'AVAILABLE',
    badges: ['Universal Hero (O-)', 'Rapid Responder', '8x Donor'],
    email: 'donor001@example.com',
    preferredHospitalId: 'hosp-01',
    donationHistory: [
      {
        id: 'don-rec-101',
        donorId: 'donor-01',
        donorName: 'Demo Donor 001',
        bloodGroup: 'O-',
        component: 'PRBC',
        unitsDonated: 1,
        donationDate: '2026-06-15T10:00:00.000Z',
        facilityName: 'Demo Blood Bank 01 - Metro Central',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-01',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 14.8, bloodPressure: '120/78', pulseBpm: 70, weightKg: 74 },
        certificateId: 'CERT-2026-0615-01',
        notes: 'Volunteer whole blood drive collection'
      },
      {
        id: 'don-rec-102',
        donorId: 'donor-01',
        donorName: 'Demo Donor 001',
        bloodGroup: 'O-',
        component: 'PRBC',
        unitsDonated: 1,
        donationDate: '2026-03-20T11:30:00.000Z',
        facilityName: 'Demo Hospital 01 - City Emergency Trauma Center',
        facilityType: 'HOSPITAL',
        facilityId: 'hosp-01',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 14.6, bloodPressure: '118/76', pulseBpm: 72, weightKg: 74 },
        certificateId: 'CERT-2026-0320-01',
        notes: 'Emergency Code Red call response'
      }
    ]
  },
  {
    id: 'donor-02',
    name: 'Demo Donor 002',
    code: 'DD-002',
    bloodGroup: 'A+',
    age: 34,
    gender: 'FEMALE',
    weightKg: 62,
    contactNumber: '+1 (555) 017-0002',
    city: 'San Francisco',
    location: { lat: 37.7812, lng: -122.4082 },
    lastDonationDate: '2026-05-10T14:30:00.000Z',
    totalDonations: 12,
    isEligible: true,
    status: 'AVAILABLE',
    availability: 'AVAILABLE',
    badges: ['Milestone 10+', 'Platelet Champion'],
    email: 'donor002@example.com',
    preferredHospitalId: 'hosp-02',
    donationHistory: [
      {
        id: 'don-rec-201',
        donorId: 'donor-02',
        donorName: 'Demo Donor 002',
        bloodGroup: 'A+',
        component: 'PLATELETS',
        unitsDonated: 1,
        donationDate: '2026-05-10T14:30:00.000Z',
        facilityName: 'Demo Blood Bank 02 - City Trauma Regional',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-02',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 13.5, bloodPressure: '115/75', pulseBpm: 68, weightKg: 62 },
        certificateId: 'CERT-2026-0510-02',
        notes: 'Single donor apheresis platelet run'
      }
    ]
  },
  {
    id: 'donor-03',
    name: 'Demo Donor 003',
    code: 'DD-003',
    bloodGroup: 'B+',
    age: 26,
    gender: 'MALE',
    weightKg: 78,
    contactNumber: '+1 (555) 017-0003',
    city: 'San Francisco',
    location: { lat: 37.7601, lng: -122.4295 },
    lastDonationDate: '2026-07-01T09:15:00.000Z',
    totalDonations: 5,
    isEligible: true,
    status: 'AVAILABLE',
    availability: 'AVAILABLE',
    badges: ['Emergency Ready'],
    email: 'donor003@example.com',
    preferredHospitalId: 'hosp-03',
    donationHistory: [
      {
        id: 'don-rec-301',
        donorId: 'donor-03',
        donorName: 'Demo Donor 003',
        bloodGroup: 'B+',
        component: 'PRBC',
        unitsDonated: 1,
        donationDate: '2026-07-01T09:15:00.000Z',
        facilityName: 'Demo Blood Bank 03 - RedCross Life Center',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-03',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 15.2, bloodPressure: '122/80', pulseBpm: 66, weightKg: 78 },
        certificateId: 'CERT-2026-0701-03',
        notes: 'Standard red cell unit'
      }
    ]
  },
  {
    id: 'donor-04',
    name: 'Demo Donor 004',
    code: 'DD-004',
    bloodGroup: 'AB+',
    age: 41,
    gender: 'FEMALE',
    weightKg: 68,
    contactNumber: '+1 (555) 017-0004',
    city: 'San Francisco',
    location: { lat: 37.7925, lng: -122.4350 },
    lastDonationDate: '2026-06-20T11:00:00.000Z',
    totalDonations: 15,
    isEligible: true,
    status: 'AVAILABLE',
    availability: 'AVAILABLE',
    badges: ['Universal Plasma Star', '15x Donor Club'],
    email: 'donor004@example.com',
    donationHistory: [
      {
        id: 'don-rec-401',
        donorId: 'donor-04',
        donorName: 'Demo Donor 004',
        bloodGroup: 'AB+',
        component: 'FFP',
        unitsDonated: 2,
        donationDate: '2026-06-20T11:00:00.000Z',
        facilityName: 'Demo Blood Bank 01 - Metro Central',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-01',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 13.9, bloodPressure: '118/74', pulseBpm: 69, weightKg: 68 },
        certificateId: 'CERT-2026-0620-04',
        notes: 'Universal recipient plasma donation'
      }
    ]
  },
  {
    id: 'donor-05',
    name: 'Demo Donor 005',
    code: 'DD-005',
    bloodGroup: 'O+',
    age: 23,
    gender: 'FEMALE',
    weightKg: 55,
    contactNumber: '+1 (555) 017-0005',
    city: 'San Francisco',
    location: { lat: 37.7510, lng: -122.4150 },
    lastDonationDate: '2026-09-10T16:00:00.000Z',
    totalDonations: 2,
    isEligible: false,
    status: 'COOLDOWN',
    availability: 'AVAILABLE',
    badges: ['Youth Ambassador'],
    email: 'donor005@example.com',
    donationHistory: [
      {
        id: 'don-rec-501',
        donorId: 'donor-05',
        donorName: 'Demo Donor 005',
        bloodGroup: 'O+',
        component: 'PRBC',
        unitsDonated: 1,
        donationDate: '2026-09-10T16:00:00.000Z',
        facilityName: 'Demo Blood Bank 02 - City Trauma Regional',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-02',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 12.8, bloodPressure: '110/70', pulseBpm: 75, weightKg: 55 },
        certificateId: 'CERT-2026-0910-05',
        notes: 'Routine community drive'
      }
    ]
  },
  {
    id: 'donor-06',
    name: 'Demo Donor 006',
    code: 'DD-006',
    bloodGroup: 'A-',
    age: 38,
    gender: 'MALE',
    weightKg: 82,
    contactNumber: '+1 (555) 017-0006',
    city: 'San Francisco',
    location: { lat: 37.7780, lng: -122.4490 },
    lastDonationDate: '2026-04-12T10:00:00.000Z',
    totalDonations: 9,
    isEligible: true,
    status: 'AVAILABLE',
    availability: 'AVAILABLE',
    badges: ['Rare Type Champion', 'Silver Star'],
    email: 'donor006@example.com',
    donationHistory: [
      {
        id: 'don-rec-601',
        donorId: 'donor-06',
        donorName: 'Demo Donor 006',
        bloodGroup: 'A-',
        component: 'PRBC',
        unitsDonated: 1,
        donationDate: '2026-04-12T10:00:00.000Z',
        facilityName: 'Demo Blood Bank 03 - RedCross Life Center',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-03',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 15.6, bloodPressure: '124/82', pulseBpm: 64, weightKg: 82 },
        certificateId: 'CERT-2026-0412-06',
        notes: 'Annual corporate drive'
      }
    ]
  },
  {
    id: 'donor-07',
    name: 'Demo Donor 007',
    code: 'DD-007',
    bloodGroup: 'B-',
    age: 31,
    gender: 'FEMALE',
    weightKg: 59,
    contactNumber: '+1 (555) 017-0007',
    city: 'San Francisco',
    location: { lat: 37.7850, lng: -122.4120 },
    lastDonationDate: '2026-06-02T13:45:00.000Z',
    totalDonations: 4,
    isEligible: true,
    status: 'AVAILABLE',
    availability: 'AVAILABLE',
    badges: ['Rare Type Champion'],
    email: 'donor007@example.com',
    donationHistory: [
      {
        id: 'don-rec-701',
        donorId: 'donor-07',
        donorName: 'Demo Donor 007',
        bloodGroup: 'B-',
        component: 'PRBC',
        unitsDonated: 1,
        donationDate: '2026-06-02T13:45:00.000Z',
        facilityName: 'Demo Blood Bank 01 - Metro Central',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-01',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 13.2, bloodPressure: '112/72', pulseBpm: 71, weightKg: 59 },
        certificateId: 'CERT-2026-0602-07',
        notes: 'Targeted pediatric surgical request'
      }
    ]
  },
  {
    id: 'donor-08',
    name: 'Demo Donor 008',
    code: 'DD-008',
    bloodGroup: 'AB-',
    age: 45,
    gender: 'MALE',
    weightKg: 80,
    contactNumber: '+1 (555) 017-0008',
    city: 'San Francisco',
    location: { lat: 37.7690, lng: -122.4430 },
    lastDonationDate: '2026-05-28T15:00:00.000Z',
    totalDonations: 7,
    isEligible: true,
    status: 'AVAILABLE',
    availability: 'UNAVAILABLE',
    badges: ['Ultra Rare AB- Defender'],
    email: 'donor008@example.com',
    donationHistory: [
      {
        id: 'don-rec-801',
        donorId: 'donor-08',
        donorName: 'Demo Donor 008',
        bloodGroup: 'AB-',
        component: 'FFP',
        unitsDonated: 2,
        donationDate: '2026-05-28T15:00:00.000Z',
        facilityName: 'Demo Blood Bank 02 - City Trauma Regional',
        facilityType: 'BLOOD_BANK',
        facilityId: 'bb-02',
        status: 'COMPLETED',
        vitals: { hemoglobinGdl: 14.9, bloodPressure: '128/84', pulseBpm: 76, weightKg: 80 },
        certificateId: 'CERT-2026-0528-08',
        notes: 'Plasma donation'
      }
    ]
  }
];

let usersDb: any[] = [
  {
    id: 'user-admin-01',
    name: 'SysAdmin Sarah Miller',
    email: 'admin@bloodbridge.org',
    role: 'ADMIN',
    status: 'ACTIVE',
    registeredAt: '2026-01-10T08:00:00.000Z',
    lastActive: 'Just now',
    associatedFacility: 'BloodBridge Central Operations',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 010-0001'
  },
  {
    id: 'user-pat-101',
    name: 'Demo Patient 101',
    email: 'patient101@example.com',
    role: 'PATIENT',
    status: 'ACTIVE',
    registeredAt: '2026-07-15T09:00:00.000Z',
    lastActive: '10m ago',
    associatedFacility: 'Patient Outpatient Registry',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 019-9941'
  },
  {
    id: 'user-hosp-01',
    name: 'Dr. Sarah Adams',
    email: 's.adams@demohospital01.org',
    role: 'HOSPITAL',
    status: 'ACTIVE',
    registeredAt: '2026-02-01T10:00:00.000Z',
    lastActive: '3m ago',
    associatedFacility: 'Demo Hospital 01 - City Emergency Trauma Center',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 012-7001'
  },
  {
    id: 'user-hosp-02',
    name: 'Dr. Michael Chen',
    email: 'm.chen@stjudememorial.org',
    role: 'HOSPITAL',
    status: 'ACTIVE',
    registeredAt: '2026-03-12T11:00:00.000Z',
    lastActive: '1h ago',
    associatedFacility: 'Demo Hospital 02 - St. Jude Memorial Hospital',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 012-7002'
  },
  {
    id: 'user-staff-01',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@metrobloodbank.org',
    role: 'BLOOD_BANK_STAFF',
    status: 'ACTIVE',
    registeredAt: '2026-02-15T14:00:00.000Z',
    lastActive: '5m ago',
    associatedFacility: 'Demo Blood Bank 01 - Metro Central',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 019-2831'
  },
  {
    id: 'user-staff-02',
    name: 'Elena Rostova (Lab Supervisor)',
    email: 'e.rostova@citytrauma.org',
    role: 'BLOOD_BANK_STAFF',
    status: 'ACTIVE',
    registeredAt: '2026-03-01T09:30:00.000Z',
    lastActive: '25m ago',
    associatedFacility: 'Demo Blood Bank 02 - City Trauma Regional',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 019-4492'
  },
  {
    id: 'user-donor-01',
    name: 'Demo Donor 001',
    email: 'donor001@example.com',
    role: 'DONOR',
    status: 'ACTIVE',
    registeredAt: '2026-04-10T15:30:00.000Z',
    lastActive: '2m ago',
    associatedFacility: 'Community Donor Network',
    bloodGroup: 'O-',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 017-0001'
  },
  {
    id: 'user-donor-02',
    name: 'Demo Donor 002',
    email: 'donor002@example.com',
    role: 'DONOR',
    status: 'ACTIVE',
    registeredAt: '2026-05-02T16:00:00.000Z',
    lastActive: '3h ago',
    associatedFacility: 'Community Donor Network',
    bloodGroup: 'A+',
    verificationStatus: 'VERIFIED',
    phone: '+1 (555) 017-0002'
  },
  {
    id: 'user-donor-05',
    name: 'Demo Donor 005',
    email: 'donor005@example.com',
    role: 'DONOR',
    status: 'PENDING',
    registeredAt: '2026-09-20T12:00:00.000Z',
    lastActive: '1d ago',
    associatedFacility: 'Community Donor Network',
    bloodGroup: 'O+',
    verificationStatus: 'PENDING',
    phone: '+1 (555) 017-0005'
  }
];

// Helper to register blood bank routes
const registerBloodBankRoutes = (prefix: string) => {
  // GET /blood-banks
  app.get(`${prefix}/blood-banks`, (req, res) => {
    return res.json({
      bloodBanks: bloodBanksDb,
      total: bloodBanksDb.length
    });
  });

  // GET /blood-banks/:id
  app.get(`${prefix}/blood-banks/:id`, (req, res) => {
    const bank = bloodBanksDb.find(b => b.id === req.params.id);
    if (!bank) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }
    return res.json(bank);
  });

  // PATCH /blood-banks/:id/verification (Admin Action)
  app.patch(`${prefix}/blood-banks/:id/verification`, (req, res) => {
    const bank = bloodBanksDb.find(b => b.id === req.params.id);
    if (!bank) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }
    const { verified, reason, auditorName } = req.body;
    if (typeof verified !== 'boolean') {
      return res.status(400).json({ error: 'Field "verified" must be a boolean.' });
    }
    bank.verified = verified;
    bank.lastVerifiedAt = new Date().toISOString();
    bank.verificationReason = reason || 'Admin review compliance sign-off';
    bank.auditorName = auditorName || 'System Administrator';
    return res.json({
      success: true,
      message: `Blood bank ${bank.name} verification status set to ${verified ? 'VERIFIED' : 'UNVERIFIED'}`,
      bank
    });
  });

  // GET /blood-banks/:id/inventory
  app.get(`${prefix}/blood-banks/:id/inventory`, (req, res) => {
    const bank = bloodBanksDb.find(b => b.id === req.params.id);
    if (!bank) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    const { component, bloodGroup } = req.query;
    let items = Object.values(bank.inventory);

    if (component && typeof component === 'string' && component !== 'ALL') {
      items = items.filter((i: any) => i.component === component);
    }
    if (bloodGroup && typeof bloodGroup === 'string' && bloodGroup !== 'ALL') {
      items = items.filter((i: any) => i.bloodGroup === bloodGroup);
    }

    let totalAvailable = 0;
    let totalReserved = 0;
    let criticalAlertsCount = 0;
    let lowStockCount = 0;
    let latestUpdate = '2026-09-28T07:00:00.000Z';

    Object.values(bank.inventory).forEach((inv: any) => {
      totalAvailable += inv.unitsAvailable || 0;
      totalReserved += inv.unitsReserved || 0;
      if (inv.unitsAvailable <= inv.criticalThreshold) {
        criticalAlertsCount++;
      } else if (inv.unitsAvailable <= Math.round(inv.criticalThreshold * 1.5)) {
        lowStockCount++;
      }
      if (inv.lastUpdated && inv.lastUpdated > latestUpdate) {
        latestUpdate = inv.lastUpdated;
      }
    });

    return res.json({
      bankId: bank.id,
      bankName: bank.name,
      bankCode: bank.code,
      inventory: items,
      totalAvailable,
      totalReserved,
      criticalAlertsCount,
      lowStockCount,
      lastUpdated: latestUpdate
    });
  });

  // PATCH /blood-banks/:id/inventory
  app.patch(`${prefix}/blood-banks/:id/inventory`, (req, res) => {
    const bank = bloodBanksDb.find(b => b.id === req.params.id);
    if (!bank) {
      return res.status(404).json({ error: 'Blood bank not found' });
    }

    const { bloodGroup, component = 'PRBC', unitsAvailable, newUnits, staffBloodBankId, reason } = req.body;
    const callerStaffBankId = staffBloodBankId || req.headers['x-staff-bank-id'];

    // Unauthorized check: staff from bank A cannot modify bank B
    if (callerStaffBankId && callerStaffBankId !== req.params.id) {
      return res.status(403).json({
        error: `Unauthorized: staff associated with facility ${callerStaffBankId} cannot modify inventory at ${req.params.id}`
      });
    }

    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!bloodGroup || !validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({ error: `Invalid blood group: ${bloodGroup}. Must be one of standard ABO/Rh groups.` });
    }

    // Validate component
    const validComponents = ['PRBC', 'WHOLE_BLOOD', 'PLATELETS', 'FFP', 'CRYOPRECIPITATE'];
    if (!validComponents.includes(component)) {
      return res.status(400).json({ error: `Invalid blood component: ${component}` });
    }

    // Validate units: prevent negative units
    const units = typeof newUnits === 'number' ? newUnits : typeof unitsAvailable === 'number' ? unitsAvailable : null;
    if (units === null || isNaN(units) || units < 0 || !Number.isInteger(units)) {
      return res.status(400).json({ error: 'Invalid units quantity. Negative inventory is strictly prohibited. Must be a non-negative integer.' });
    }

    const key = `${bloodGroup}_${component}`;
    const existing = bank.inventory[key] || {
      bloodGroup,
      component,
      unitsAvailable: 0,
      unitsReserved: 0,
      criticalThreshold: component === 'PRBC' ? 5 : 3,
      expiryWithinDays: component === 'PLATELETS' ? 4 : 28
    };

    const updatedTimestamp = new Date().toISOString();
    const updatedStatus = computeStockStatus(units, existing.criticalThreshold);

    const updatedItem = {
      ...existing,
      unitsAvailable: units,
      lastUpdated: updatedTimestamp,
      status: updatedStatus,
      lastAdjustmentReason: reason || 'Manual clinical adjustment'
    };

    bank.inventory[key] = updatedItem;

    return res.json({
      success: true,
      message: `Updated inventory for ${bloodGroup} ${component} to ${units} units`,
      updatedItem,
      inventory: bank.inventory
    });
  });
};

// Helper to handle both /blood-requests and /api/blood-requests
const registerBloodRequestRoutes = (prefix: string) => {
  // GET /blood-requests
  app.get(`${prefix}/blood-requests`, (req, res) => {
    let result = [...bloodRequestsDb];
    const { status, urgency, bloodGroup, requesterRole } = req.query;

    if (status && typeof status === 'string' && status !== 'ALL') {
      result = result.filter(r => r.status === status);
    }
    if (urgency && typeof urgency === 'string' && urgency !== 'ALL') {
      result = result.filter(r => r.urgency === urgency);
    }
    if (bloodGroup && typeof bloodGroup === 'string' && bloodGroup !== 'ALL') {
      result = result.filter(r => r.bloodGroup === bloodGroup);
    }
    if (requesterRole && typeof requesterRole === 'string' && requesterRole !== 'ALL') {
      result = result.filter(r => r.requesterRole === requesterRole);
    }

    return res.json({
      requests: result,
      total: result.length
    });
  });

  // GET /blood-requests/:id
  app.get(`${prefix}/blood-requests/:id`, (req, res) => {
    const request = bloodRequestsDb.find(r => r.id === req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' });
    }
    return res.json(request);
  });

  // POST /blood-requests
  app.post(`${prefix}/blood-requests`, (req, res) => {
    const {
      patientName,
      hospitalId,
      hospitalName,
      requesterRole,
      bloodGroup,
      component,
      unitsRequired,
      unitsNeeded,
      urgency,
      requiredDateTime,
      location,
      contactInformation,
      clinicalReason,
      additionalNotes,
      notes
    } = req.body;

    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!bloodGroup || !validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({ error: 'Invalid or missing blood group.' });
    }

    const units = Number(unitsRequired || unitsNeeded || 0);
    if (!units || units < 1 || units > 10) {
      return res.status(400).json({ error: 'Units required must be an integer between 1 and 10.' });
    }

    if (!urgency || !['CRITICAL', 'HIGH', 'MEDIUM', 'ROUTINE'].includes(urgency)) {
      return res.status(400).json({ error: 'Invalid urgency classification.' });
    }

    const now = new Date();
    const reqSeq = bloodRequestsDb.length + 105;
    const reqNumber = `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${reqSeq}`;

    const newRequest = {
      id: `req-${Date.now()}`,
      requestNumber: reqNumber,
      patientName: patientName || `Demo Patient ${reqSeq}`,
      patientId: `DP-${reqSeq}`,
      hospitalId: hospitalId || 'hosp-01',
      hospitalName: hospitalName || 'Demo Hospital 01 - City Emergency Trauma Center',
      requesterRole: requesterRole || 'HOSPITAL',
      bloodGroup,
      component: component || 'PRBC',
      unitsRequired: units,
      unitsNeeded: units,
      unitsAllocated: urgency === 'CRITICAL' ? units : Math.min(units, 2),
      urgency,
      requiredDateTime: requiredDateTime || new Date(Date.now() + 3600000 * 4).toISOString(),
      location: location || {
        hospitalName: hospitalName || 'Demo Hospital 01',
        address: '1001 Potrero Ave, San Francisco',
        lat: 37.7558,
        lng: -122.4045
      },
      contactInformation: contactInformation || {
        contactPerson: 'Duty Medical Officer',
        phoneNumber: '+1 (555) 012-7000',
        relationship: 'Attending'
      },
      clinicalReason: clinicalReason || 'Urgent transfusion evaluation',
      additionalNotes: additionalNotes || notes || '',
      notes: additionalNotes || notes || '',
      city: 'San Francisco',
      status: urgency === 'CRITICAL' ? 'ACCEPTED' : 'MATCHED',
      createdAt: now.toISOString(),
      estimatedArrivalMin: urgency === 'CRITICAL' ? 15 : 30,
      matchedSources: [
        {
          stage: 'INVENTORY_EXACT',
          sourceId: 'bb-01',
          sourceName: 'Demo Blood Bank 01 - Metro Central',
          sourceType: 'BLOOD_BANK',
          bloodGroupOffered: bloodGroup,
          unitsAllocated: urgency === 'CRITICAL' ? units : Math.min(units, 2),
          distanceKm: 2.8,
          status: 'RESERVED'
        }
      ],
      donorAlertsSent: 0,
      donorAlertsAccepted: 0
    };

    bloodRequestsDb.unshift(newRequest);
    return res.status(201).json(newRequest);
  });

  // PATCH /blood-requests/:id/status
  app.patch(`${prefix}/blood-requests/:id/status`, (req, res) => {
    const { status, notes } = req.body;
    const requestIndex = bloodRequestsDb.findIndex(r => r.id === req.params.id);

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    const validStatuses = [
      'CREATED',
      'SEARCHING',
      'MATCHED',
      'PENDING_CONFIRMATION',
      'ACCEPTED',
      'RESERVED',
      'FULFILLED',
      'REJECTED',
      'CANCELLED',
      'EXPIRED'
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status: ${status}. Must be one of standard statuses.` });
    }

    const existing = bloodRequestsDb[requestIndex];
    const updated = {
      ...existing,
      status,
      additionalNotes: notes ? `${existing.additionalNotes || ''} [Update: ${notes}]`.trim() : existing.additionalNotes,
      notes: notes ? `${existing.notes || ''} [Update: ${notes}]`.trim() : existing.notes
    };

    bloodRequestsDb[requestIndex] = updated;
    return res.json(updated);
  });

  // GET /blood-requests/:id/matches
  app.get(`${prefix}/blood-requests/:id/matches`, (req, res) => {
    const request = bloodRequestsDb.find(r => r.id === req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    return res.json({
      requestId: request.id,
      requestNumber: request.requestNumber,
      status: request.status,
      unitsRequired: request.unitsRequired || request.unitsNeeded,
      unitsAllocated: request.unitsAllocated,
      matches: request.matchedSources || []
    });
  });

  // POST /blood-requests/:id/matches/:matchId/respond
  app.post(`${prefix}/blood-requests/:id/matches/:matchId/respond`, (req, res) => {
    const request = bloodRequestsDb.find(r => r.id === req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Blood request not found' });
    }

    const { action, donorId } = req.body;
    if (!['ACCEPT', 'DECLINE'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "ACCEPT" or "DECLINE".' });
    }

    if (action === 'ACCEPT') {
      request.donorAlertsAccepted = (request.donorAlertsAccepted || 0) + 1;
      const targetUnits = request.unitsRequired || request.unitsNeeded || 1;
      if (request.unitsAllocated < targetUnits) {
        request.unitsAllocated += 1;
      }
      if (request.unitsAllocated >= targetUnits) {
        request.status = 'RESERVED';
      } else {
        request.status = 'ACCEPTED';
      }

      if (donorId) {
        const donor = donorsDb.find(d => d.id === donorId);
        if (donor) {
          donor.status = 'ON_CALL';
        }
      }

      return res.json({
        success: true,
        message: 'Match accepted. Emergency requisition allocation updated.',
        request
      });
    } else {
      return res.json({
        success: true,
        message: 'Match declined by recipient/donor.',
        request
      });
    }
  });
};

const registerDonorRoutes = (prefix: string) => {
  // GET /donors
  app.get(`${prefix}/donors`, (req, res) => {
    let result = [...donorsDb];
    const { bloodGroup, availability, status, city } = req.query;

    if (bloodGroup && typeof bloodGroup === 'string' && bloodGroup !== 'ALL') {
      result = result.filter(d => d.bloodGroup === bloodGroup);
    }
    if (availability && typeof availability === 'string' && availability !== 'ALL') {
      result = result.filter(d => d.availability === availability);
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      result = result.filter(d => d.status === status);
    }
    if (city && typeof city === 'string') {
      result = result.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
    }

    // Mask phone numbers to preserve privacy in public lists per instructions:
    // "Do not expose donor phone numbers or private personal data publicly."
    const sanitized = result.map(d => ({
      ...d,
      contactNumber: d.contactNumber
        ? d.contactNumber.replace(/(\+\d{1,2}\s*\(\d{3}\)\s*)(\d{3})-(\d{4})/, '$1***-**$3')
        : 'Confidential'
    }));

    return res.json({
      donors: sanitized,
      total: sanitized.length
    });
  });

  // POST /donors - Register new volunteer donor
  app.post(`${prefix}/donors`, (req, res) => {
    const { name, bloodGroup, age, gender, weightKg, contactNumber, city, email, preferredHospitalId, location } = req.body;
    if (!name || !bloodGroup) {
      return res.status(400).json({ error: 'Name and blood group are required.' });
    }

    const id = req.body.id || `donor-${Date.now()}`;
    const code = req.body.code || `DD-${Math.floor(100 + Math.random() * 900)}`;

    const newDonor = {
      id,
      code,
      name,
      bloodGroup,
      age: age || 25,
      gender: gender || 'OTHER',
      weightKg: weightKg || 65,
      contactNumber: contactNumber || '+1 (555) 019-0000',
      city: city || 'San Francisco',
      location: location || { lat: 37.7749, lng: -122.4194 },
      email: email || `${name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      preferredHospitalId: preferredHospitalId || 'hosp-01',
      lastDonationDate: null,
      totalDonations: 0,
      isEligible: true,
      status: 'AVAILABLE',
      availability: 'AVAILABLE',
      badges: ['New Volunteer Hero'],
      donationHistory: []
    };

    donorsDb.unshift(newDonor);
    return res.status(201).json(newDonor);
  });

  // GET /donors/:id
  app.get(`${prefix}/donors/:id`, (req, res) => {
    const donor = donorsDb.find(d => d.id === req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    return res.json(donor);
  });

  // PATCH /donors/:id/availability
  app.patch(`${prefix}/donors/:id/availability`, (req, res) => {
    const donor = donorsDb.find(d => d.id === req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    const { availability, status, notes } = req.body;
    if (availability && !['AVAILABLE', 'UNAVAILABLE'].includes(availability)) {
      return res.status(400).json({ error: 'Availability must be either "AVAILABLE" or "UNAVAILABLE".' });
    }

    if (availability) {
      donor.availability = availability;
      if (availability === 'UNAVAILABLE' && donor.status === 'AVAILABLE') {
        donor.status = 'INELIGIBLE';
      } else if (availability === 'AVAILABLE' && donor.status === 'INELIGIBLE') {
        donor.status = donor.isEligible ? 'AVAILABLE' : 'COOLDOWN';
      }
    }

    if (status && ['AVAILABLE', 'ON_CALL', 'COOLDOWN', 'INELIGIBLE'].includes(status)) {
      donor.status = status;
    }

    donor.lastUpdated = new Date().toISOString();
    if (notes) donor.availabilityNotes = notes;

    return res.json({
      success: true,
      message: `Donor availability updated to ${donor.availability} (Status: ${donor.status})`,
      donor
    });
  });

  // GET /donors/:id/history
  app.get(`${prefix}/donors/:id/history`, (req, res) => {
    const donor = donorsDb.find(d => d.id === req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    return res.json({
      donorId: donor.id,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      totalDonations: donor.totalDonations,
      history: donor.donationHistory || []
    });
  });

  // POST /donors/:id/history
  app.post(`${prefix}/donors/:id/history`, (req, res) => {
    const donor = donorsDb.find(d => d.id === req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor not found' });
    }
    const { facilityName, facilityType = 'BLOOD_BANK', component = 'PRBC', unitsDonated = 1, donationDate, notes, vitals } = req.body;
    const now = new Date();
    const newRecord = {
      id: `don-rec-${Date.now()}`,
      donorId: donor.id,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      component,
      unitsDonated: Number(unitsDonated) || 1,
      donationDate: donationDate || now.toISOString(),
      facilityName: facilityName || 'Demo Blood Bank 01 - Metro Central',
      facilityType,
      status: 'COMPLETED',
      vitals: vitals || { hemoglobinGdl: 14.5, bloodPressure: '120/80', pulseBpm: 72, weightKg: donor.weightKg },
      certificateId: `CERT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 900) + 100}`,
      notes: notes || 'Voluntary donor service donation'
    };

    if (!donor.donationHistory) donor.donationHistory = [];
    donor.donationHistory.unshift(newRecord);
    donor.totalDonations += Number(unitsDonated) || 1;
    donor.lastDonationDate = newRecord.donationDate;
    donor.status = 'COOLDOWN'; // 56-day cooldown initiated

    return res.status(201).json({
      success: true,
      message: 'Donation record logged successfully. Cooldown period initiated.',
      record: newRecord,
      donor
    });
  });
};

const registerAnalyticsRoutes = (prefix: string) => {
  // GET /analytics/demand
  app.get(`${prefix}/analytics/demand`, (req, res) => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const requestsByBloodGroup: Record<string, number> = {};
    const requestsByUrgency: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      ROUTINE: 0
    };

    bloodGroups.forEach(bg => { requestsByBloodGroup[bg] = 0; });

    let fulfilledCount = 0;
    bloodRequestsDb.forEach(r => {
      if (requestsByBloodGroup[r.bloodGroup] !== undefined) {
        requestsByBloodGroup[r.bloodGroup] += (r.unitsRequired || r.unitsNeeded || 1);
      }
      if (requestsByUrgency[r.urgency] !== undefined) {
        requestsByUrgency[r.urgency]++;
      }
      if (r.status === 'FULFILLED') {
        fulfilledCount++;
      }
    });

    const totalRequests = bloodRequestsDb.length;
    const fulfillmentRate = totalRequests > 0 ? Math.round((fulfilledCount / totalRequests) * 100) : 100;

    const requestsByMonth = [
      { month: 'May 2026', count: 18, fulfilled: 17 },
      { month: 'Jun 2026', count: 24, fulfilled: 23 },
      { month: 'Jul 2026', count: 31, fulfilled: 29 },
      { month: 'Aug 2026', count: 28, fulfilled: 27 },
      { month: 'Sep 2026', count: 36 + totalRequests, fulfilled: 32 + fulfilledCount }
    ];

    const requestsByWeek = [
      { week: 'W35 (Aug 24)', count: 7, critical: 2 },
      { week: 'W36 (Aug 31)', count: 9, critical: 3 },
      { week: 'W37 (Sep 07)', count: 8, critical: 1 },
      { week: 'W38 (Sep 14)', count: 12, critical: 4 },
      { week: 'W39 (Sep 21)', count: 14 + totalRequests, critical: 5 + (requestsByUrgency.CRITICAL || 0) }
    ];

    return res.json({
      totalRequests,
      fulfilledRequests: fulfilledCount,
      fulfillmentRate,
      requestsByBloodGroup,
      requestsByUrgency,
      requestsByMonth,
      requestsByWeek,
      demandTrend: 'INCREASING'
    });
  });

  // GET /analytics/inventory
  app.get(`${prefix}/analytics/inventory`, (req, res) => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const components = ['PRBC', 'WHOLE_BLOOD', 'PLATELETS', 'FFP', 'CRYOPRECIPITATE'];

    const inventoryByBloodGroup: Record<string, number> = {};
    const inventoryByComponent: Record<string, number> = {};
    bloodGroups.forEach(bg => { inventoryByBloodGroup[bg] = 0; });
    components.forEach(comp => { inventoryByComponent[comp] = 0; });

    let totalAvailableUnits = 0;
    let totalReservedUnits = 0;

    const bankSummaries = bloodBanksDb.map(b => {
      let bTotal = 0;
      let bCrit = 0;
      Object.values(b.inventory).forEach((inv: any) => {
        const avail = inv.unitsAvailable || 0;
        const resv = inv.unitsReserved || 0;
        bTotal += avail;
        totalAvailableUnits += avail;
        totalReservedUnits += resv;

        if (inventoryByBloodGroup[inv.bloodGroup] !== undefined) {
          inventoryByBloodGroup[inv.bloodGroup] += avail;
        }
        if (inventoryByComponent[inv.component] !== undefined) {
          inventoryByComponent[inv.component] += avail;
        }
        if (avail <= inv.criticalThreshold) {
          bCrit++;
        }
      });

      return {
        id: b.id,
        name: b.name,
        code: b.code,
        totalUnits: bTotal,
        criticalCount: bCrit,
        verified: b.verified
      };
    });

    const criticalStockGroups = bloodGroups.filter(bg => (inventoryByBloodGroup[bg] || 0) < 15);

    return res.json({
      totalAvailableUnits,
      totalReservedUnits,
      inventoryByBloodGroup,
      inventoryByComponent,
      criticalStockGroups,
      bankStockSummaries: bankSummaries
    });
  });

  // GET /analytics/shortage
  app.get(`${prefix}/analytics/shortage`, (req, res) => {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const groups: Record<string, any> = {};
    const criticalGroups: string[] = [];
    const attentionGroups: string[] = [];
    const normalGroups: string[] = [];

    bloodGroups.forEach(bg => {
      let unitsAvailable = 0;
      bloodBanksDb.forEach(b => {
        Object.values(b.inventory).forEach((inv: any) => {
          if (inv.bloodGroup === bg && (inv.component === 'PRBC' || inv.component === 'WHOLE_BLOOD')) {
            unitsAvailable += (inv.unitsAvailable || 0);
          }
        });
      });

      let unitsDemandedRecent = 0;
      bloodRequestsDb.forEach(r => {
        if (r.bloodGroup === bg) {
          unitsDemandedRecent += (r.unitsRequired || r.unitsNeeded || 1);
        }
      });

      const baselineWeeklyDemand = bg === 'O+' ? 14 : bg === 'O-' ? 8 : bg === 'A+' ? 10 : 5;
      const combinedDemand = unitsDemandedRecent + baselineWeeklyDemand;
      const burnRatePerDay = Number((combinedDemand / 7).toFixed(1));
      const bufferDays = Number((unitsAvailable / Math.max(0.5, burnRatePerDay)).toFixed(1));

      let status: 'NORMAL' | 'ATTENTION' | 'POTENTIAL_SHORTAGE' = 'NORMAL';
      let statusReason = '';
      let recommendedAction = '';

      if (bufferDays <= 3.0 || unitsAvailable <= 10) {
        status = 'POTENTIAL_SHORTAGE';
        criticalGroups.push(bg);
        statusReason = `Critical buffer depletion: only ${bufferDays} days of reserves remaining at ${burnRatePerDay} units/day burn rate.`;
        recommendedAction = `Trigger targeted emergency donor SOS mobilization for ${bg} registered donors immediately.`;
      } else if (bufferDays <= 6.0 || unitsAvailable <= 20) {
        status = 'ATTENTION';
        attentionGroups.push(bg);
        statusReason = `Moderate inventory buffer: ${bufferDays} days of reserves available. Approaching safety threshold.`;
        recommendedAction = `Prioritize volunteer donation appointments and monitor inter-bank transfer buffers.`;
      } else {
        status = 'NORMAL';
        normalGroups.push(bg);
        statusReason = `Adequate inventory: ${bufferDays} days reserve buffer safely above regional clinical minimums.`;
        recommendedAction = `Maintain standard cold-chain storage and routine inventory turnover.`;
      }

      groups[bg] = {
        bloodGroup: bg,
        unitsAvailable,
        unitsDemandedRecent: combinedDemand,
        burnRatePerDay,
        bufferDays,
        status,
        statusReason,
        recommendedAction
      };
    });

    const overallStatus = criticalGroups.length > 0
      ? 'POTENTIAL_SHORTAGE'
      : attentionGroups.length > 0
      ? 'ATTENTION'
      : 'NORMAL';

    return res.json({
      timestamp: new Date().toISOString(),
      overallStatus,
      criticalGroups,
      attentionGroups,
      normalGroups,
      groups,
      calculationMethod: 'Deterministic inventory-to-burn-rate ratio: bufferDays = availableUnits / (7-day demand / 7). Clinical indicator, not automated medical decision.'
    });
  });
};

const registerUserRoutes = (prefix: string) => {
  // GET /users
  app.get(`${prefix}/users`, (req, res) => {
    let result = [...usersDb];
    const { role, status, search } = req.query;

    if (role && typeof role === 'string' && role !== 'ALL') {
      result = result.filter(u => u.role === role);
    }
    if (status && typeof status === 'string' && status !== 'ALL') {
      result = result.filter(u => u.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.associatedFacility && u.associatedFacility.toLowerCase().includes(q))
      );
    }

    return res.json({
      users: result,
      total: result.length
    });
  });

  // PATCH /users/:id
  app.patch(`${prefix}/users/:id`, (req, res) => {
    const user = usersDb.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { status, role, verificationStatus } = req.body;

    if (status && ['ACTIVE', 'PENDING', 'SUSPENDED'].includes(status)) {
      user.status = status;
    }
    if (role && ['PATIENT', 'HOSPITAL', 'BLOOD_BANK_STAFF', 'DONOR', 'ADMIN'].includes(role)) {
      user.role = role;
    }
    if (verificationStatus && ['VERIFIED', 'UNVERIFIED', 'PENDING'].includes(verificationStatus)) {
      user.verificationStatus = verificationStatus;
    }

    user.lastActive = 'Just now';

    return res.json({
      success: true,
      message: `User ${user.name} updated successfully.`,
      user
    });
  });
};

const registerAuthRoutes = (prefix: string) => {
  // POST /auth/login
  app.post(`${prefix}/auth/login`, (req, res) => {
    const { email, role, hospitalId, bloodBankId } = req.body;
    let foundUser = usersDb.find(u => u.email === email);
    if (!foundUser) {
      foundUser = usersDb.find(u => u.role === role) || {
        id: `user-${role?.toLowerCase() || 'guest'}`,
        name: `Demo ${role || 'User'}`,
        email: email || `${role?.toLowerCase() || 'user'}@bloodbridge.org`,
        role: role || 'PATIENT',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
        lastActive: 'Just now',
        associatedFacility: hospitalId || bloodBankId || 'Demo System'
      };
    }

    return res.json({
      success: true,
      user: foundUser,
      token: `demo-token-${Date.now()}`
    });
  });

  // POST /auth/register
  app.post(`${prefix}/auth/register`, (req, res) => {
    const { name, email, role = 'DONOR', bloodGroup, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required.' });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
      lastActive: 'Just now',
      associatedFacility: role === 'DONOR' ? 'Community Donor Network' : 'General Registry',
      bloodGroup: bloodGroup || 'O+',
      verificationStatus: role === 'DONOR' ? 'VERIFIED' : 'PENDING',
      phone: phone || '+1 (555) 019-0000'
    };

    usersDb.push(newUser);

    if (role === 'DONOR') {
      const newDonor = {
        id: `donor-${donorsDb.length + 1}`,
        name,
        code: `DD-00${donorsDb.length + 1}`,
        bloodGroup: bloodGroup || 'O+',
        age: 28,
        gender: 'OTHER',
        weightKg: 68,
        contactNumber: phone || '+1 (555) 019-0000',
        city: 'San Francisco',
        location: { lat: 37.7749, lng: -122.4194 },
        lastDonationDate: new Date(Date.now() - 90 * 86400000).toISOString(),
        totalDonations: 1,
        isEligible: true,
        status: 'AVAILABLE',
        availability: 'AVAILABLE',
        badges: ['New Volunteer'],
        email,
        donationHistory: []
      };
      donorsDb.push(newDonor);
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: newUser
    });
  });

  // GET /auth/me
  app.get(`${prefix}/auth/me`, (req, res) => {
    return res.json({
      user: usersDb[0]
    });
  });
};

registerBloodRequestRoutes('');
registerBloodRequestRoutes('/api');
registerBloodBankRoutes('');
registerBloodBankRoutes('/api');
registerDonorRoutes('');
registerDonorRoutes('/api');
registerAnalyticsRoutes('');
registerAnalyticsRoutes('/api');
registerUserRoutes('');
registerUserRoutes('/api');
registerAuthRoutes('');
registerAuthRoutes('/api');
app.post('/api/parse-emergency-note', async (req, res) => {
  const { note } = req.body;
  if (!note || typeof note !== 'string') {
    return res.status(400).json({ error: 'Missing note text' });
  }

  const fallbackParse = () => {
    const lower = note.toLowerCase();
    let bg = 'O-';
    if (lower.includes('o-') || lower.includes('o negative') || lower.includes('o-neg') || lower.includes('o neg')) bg = 'O-';
    else if (lower.includes('o+') || lower.includes('o positive') || lower.includes('o-pos')) bg = 'O+';
    else if (lower.includes('ab-') || lower.includes('ab negative')) bg = 'AB-';
    else if (lower.includes('ab+') || lower.includes('ab positive')) bg = 'AB+';
    else if (lower.includes('a-') || lower.includes('a negative')) bg = 'A-';
    else if (lower.includes('a+') || lower.includes('a positive')) bg = 'A+';
    else if (lower.includes('b-') || lower.includes('b negative')) bg = 'B-';
    else if (lower.includes('b+') || lower.includes('b positive')) bg = 'B+';

    let comp = 'PRBC';
    if (lower.includes('platelet') || lower.includes('rdp') || lower.includes('sdp')) comp = 'PLATELETS';
    else if (lower.includes('plasma') || lower.includes('ffp')) comp = 'FFP';
    else if (lower.includes('whole blood')) comp = 'WHOLE_BLOOD';
    else if (lower.includes('cryo')) comp = 'CRYOPRECIPITATE';

    const unitMatch = note.match(/(\d+)\s*(?:units?|pints?|bags?)/i);
    const unitsNeeded = unitMatch ? Math.min(10, Math.max(1, parseInt(unitMatch[1], 10))) : 2;

    let urgency = 'MEDIUM';
    if (lower.includes('stat') || lower.includes('hemorrhagic') || lower.includes('shock') || lower.includes('polytrauma') || lower.includes('critical') || lower.includes('immediate')) {
      urgency = 'CRITICAL';
    } else if (lower.includes('urgent') || lower.includes('active bleeding') || lower.includes('high priority')) {
      urgency = 'HIGH';
    } else if (lower.includes('scheduled') || lower.includes('tomorrow') || lower.includes('routine')) {
      urgency = 'ROUTINE';
    }

    let hospitalId = 'hosp-01';
    if (lower.includes('hospital 02') || lower.includes('st. jude')) hospitalId = 'hosp-02';
    else if (lower.includes('hospital 03') || lower.includes('apex')) hospitalId = 'hosp-03';
    else if (lower.includes('hospital 04') || lower.includes('pediatric')) hospitalId = 'hosp-04';

    const patientMatch = note.match(/(?:patient|victim|inbound)\s+([a-zA-Z0-9\s]+?)(?:,|\.|\s+diagnosed|\s+with|\s+from)/i);
    const patientName = patientMatch ? `Demo Patient (${patientMatch[1].trim()})` : 'Demo Emergency Admission';

    return {
      patientName,
      bloodGroup: bg,
      component: comp,
      unitsNeeded,
      urgency,
      clinicalReason: note.slice(0, 140),
      hospitalId
    };
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json(fallbackParse());
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are a medical clerical extraction assistant for BloodBridge.
CRITICAL SAFETY RULE: You are ONLY extracting clerical fields from the user text. You do NOT determine compatibility or medical eligibility.

Extract the following JSON fields from this clinical/paramedic dispatch note:
- "patientName": string (e.g. "Demo Patient 34yo male" or "Demo Emergency Admission")
- "bloodGroup": one of ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
- "component": one of ["PRBC", "WHOLE_BLOOD", "PLATELETS", "FFP", "CRYOPRECIPITATE"]
- "unitsNeeded": integer between 1 and 8 (default 2)
- "urgency": one of ["CRITICAL", "HIGH", "MEDIUM", "ROUTINE"]
- "clinicalReason": brief summary string

Emergency Dispatch Note:
"${note}"

Return STRICT JSON only matching the schema above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      patientName: parsed.patientName || 'Demo Emergency Admission',
      bloodGroup: parsed.bloodGroup || 'O-',
      component: parsed.component || 'PRBC',
      unitsNeeded: Number(parsed.unitsNeeded) || 2,
      urgency: parsed.urgency || 'CRITICAL',
      clinicalReason: parsed.clinicalReason || note.slice(0, 100),
      hospitalId: 'hosp-01'
    });
  } catch (error: any) {
    console.warn('Gemini extraction unavailable, using deterministic parser fallback:', error?.message || error);
    return res.json(fallbackParse());
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BloodBridge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

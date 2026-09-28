import { BloodBank, Hospital, Donor, BloodRequest, AuditLog, BloodGroup, BloodComponent, InventoryItem, SystemUser, DonationRecord } from '../types/bloodbridge';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const BLOOD_COMPONENTS: { id: BloodComponent; label: string; desc: string }[] = [
  { id: 'PRBC', label: 'Packed Red Blood Cells (PRBC)', desc: 'For anemia, acute blood loss & surgical shock' },
  { id: 'WHOLE_BLOOD', label: 'Whole Blood', desc: 'Complete blood for massive hemorrhage & exchange transfusions' },
  { id: 'PLATELETS', label: 'Platelet Concentrate / RDP / SDP', desc: 'For thrombocytopenia, dengue & chemotherapy patients' },
  { id: 'FFP', label: 'Fresh Frozen Plasma (FFP)', desc: 'For coagulation factor deficiencies & severe burns' },
  { id: 'CRYOPRECIPITATE', label: 'Cryoprecipitate', desc: 'Rich in fibrinogen and Factor VIII' },
];

function generateInventory(multiplier: number = 1): Record<string, InventoryItem> {
  const inventory: Record<string, InventoryItem> = {};
  const baseCounts: Record<BloodGroup, number> = {
    'O+': 24,
    'O-': 6,  // naturally scarcer
    'A+': 20,
    'A-': 8,
    'B+': 18,
    'B-': 7,
    'AB+': 12,
    'AB-': 4
  };

  const components: BloodComponent[] = ['PRBC', 'WHOLE_BLOOD', 'PLATELETS', 'FFP', 'CRYOPRECIPITATE'];

  BLOOD_GROUPS.forEach(bg => {
    components.forEach(comp => {
      const key = `${bg}_${comp}`;
      const factor = comp === 'PRBC' ? 1.0 : comp === 'PLATELETS' ? 0.6 : comp === 'WHOLE_BLOOD' ? 0.8 : 0.5;
      const count = Math.round(baseCounts[bg] * factor * multiplier);
      inventory[key] = {
        bloodGroup: bg,
        component: comp,
        unitsAvailable: Math.max(1, count),
        unitsReserved: Math.floor(count * 0.15),
        criticalThreshold: comp === 'PRBC' ? 5 : 3,
        expiryWithinDays: comp === 'PLATELETS' ? 4 : 28
      };
    });
  });

  return inventory;
}

// Center reference around coordinates [37.7749, -122.4194] (San Francisco Bay Metro Demo Sandbox)
export const INITIAL_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'bb-01',
    name: 'Demo Blood Bank 01 - Metro Central',
    code: 'DBB-01',
    address: '450 Healthcare Way, Suite 100',
    city: 'San Francisco',
    contactNumber: '+1 (555) 019-2831',
    operatingHours: '24/7 Emergency Operation',
    location: { lat: 37.7792, lng: -122.4184 },
    inventory: generateInventory(1.2),
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
    inventory: generateInventory(0.9),
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
    inventory: generateInventory(1.0),
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
    inventory: generateInventory(0.7),
    verified: true
  }
];

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-01',
    name: 'Demo Hospital 01 - City Emergency Trauma Center',
    code: 'DHOSP-01',
    city: 'San Francisco',
    address: '1001 Potrero Ave',
    contactNumber: '+1 (555) 012-7001',
    location: { lat: 37.7558, lng: -122.4045 },
    traumaCenterLevel: 1
  },
  {
    id: 'hosp-02',
    name: 'Demo Hospital 02 - St. Jude Memorial Hospital',
    code: 'DHOSP-02',
    city: 'San Francisco',
    address: '350 Parnassus Ave',
    contactNumber: '+1 (555) 012-7002',
    location: { lat: 37.7634, lng: -122.4582 },
    traumaCenterLevel: 2
  },
  {
    id: 'hosp-03',
    name: 'Demo Hospital 03 - Apex Metropolitan General',
    code: 'DHOSP-03',
    city: 'San Francisco',
    address: '900 Hyde Street',
    contactNumber: '+1 (555) 012-7003',
    location: { lat: 37.7891, lng: -122.4168 },
    traumaCenterLevel: 1
  },
  {
    id: 'hosp-04',
    name: 'Demo Hospital 04 - Westside Pediatric & Surgical Center',
    code: 'DHOSP-04',
    city: 'San Francisco',
    address: '1600 Divisadero St',
    contactNumber: '+1 (555) 012-7004',
    location: { lat: 37.7845, lng: -122.4402 },
    traumaCenterLevel: 2
  }
];

export const INITIAL_DONORS: Donor[] = [
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
    lastDonationDate: '2026-06-15T10:00:00.000Z', // 105 days ago - fully eligible
    totalDonations: 8,
    isEligible: true,
    status: 'AVAILABLE',
    badges: ['Universal Hero (O-)', 'Rapid Responder', '8x Donor']
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
    badges: ['Milestone 10+', 'Platelet Champion']
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
    badges: ['Emergency Ready']
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
    badges: ['Universal Plasma Star', '15x Donor Club']
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
    lastDonationDate: '2026-09-10T16:00:00.000Z', // 18 days ago - in cooldown
    totalDonations: 2,
    isEligible: false,
    status: 'COOLDOWN',
    badges: ['Youth Ambassador']
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
    badges: ['Rare Type Guardian', 'Rapid Responder']
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
    location: { lat: 37.7850, lng: -122.4200 },
    lastDonationDate: '2026-06-02T13:00:00.000Z',
    totalDonations: 6,
    isEligible: true,
    status: 'AVAILABLE',
    badges: ['Rare Type Guardian']
  },
  {
    id: 'donor-08',
    name: 'Demo Donor 008',
    code: 'DD-008',
    bloodGroup: 'O-',
    age: 45,
    gender: 'MALE',
    weightKg: 85,
    contactNumber: '+1 (555) 017-0008',
    city: 'San Francisco',
    location: { lat: 37.7690, lng: -122.4380 },
    lastDonationDate: '2026-05-25T09:00:00.000Z',
    totalDonations: 22,
    isEligible: true,
    status: 'AVAILABLE',
    badges: ['Universal Hero (O-)', 'Life Saver Tier III', '20+ Donor']
  }
];

export const INITIAL_REQUESTS: BloodRequest[] = [
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

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-01',
    timestamp: '2026-09-28T07:15:30.000Z',
    title: 'Code Red Blood Courier In Transit',
    message: 'Requisition REQ-2026-0928-101: 3 units O- PRBC dispatched by Demo Blood Bank 01. ETA 14 mins.',
    type: 'CRITICAL' as const,
    requestId: 'req-101',
    read: false
  },
  {
    id: 'notif-02',
    timestamp: '2026-09-28T06:50:00.000Z',
    title: 'Platelets Reserved For Surgery',
    message: 'Requisition REQ-2026-0928-102: 4 units Platelets reserved at Demo Blood Bank 01 & 03.',
    type: 'INFO' as const,
    requestId: 'req-102',
    read: false
  },
  {
    id: 'notif-03',
    timestamp: '2026-09-28T05:45:00.000Z',
    title: 'Requisition Fulfilled',
    message: 'Requisition REQ-2026-0928-103: Transfusion verified and completed at Demo Hospital 03.',
    type: 'SUCCESS' as const,
    requestId: 'req-103',
    read: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-28T07:15:30.000Z',
    action: 'DISPATCH_CONFIRMED',
    performedBy: 'Demo Blood Bank 01 Staff',
    role: 'BLOOD_BANK_STAFF',
    details: 'Dispatched 2 units O- PRBC for REQ-2026-0928-101. Temperature tracked courier #MED-409.',
    requestId: 'req-101'
  },
  {
    id: 'log-02',
    timestamp: '2026-09-28T07:12:10.000Z',
    action: 'DETERMINISTIC_MATCH_EXECUTED',
    performedBy: 'BloodBridge Matching Core',
    role: 'ADMIN',
    details: 'Matched 3 units O- across DBB-01 (2 units) and DBB-02 (1 unit) using deterministic clinical protocol rules.',
    requestId: 'req-101'
  },
  {
    id: 'log-03',
    timestamp: '2026-09-28T07:12:00.000Z',
    action: 'EMERGENCY_REQUEST_SUBMITTED',
    performedBy: 'Demo Hospital 01 Trauma Team',
    role: 'HOSPITAL',
    details: 'Urgency: CRITICAL. 3 units O- PRBC requested for trauma admission DP-101.',
    requestId: 'req-101'
  },
  {
    id: 'log-04',
    timestamp: '2026-09-28T06:45:00.000Z',
    action: 'RESERVATION_LOCKED',
    performedBy: 'BloodBridge Matching Core',
    role: 'HOSPITAL',
    details: 'Reserved 4 units platelets for REQ-2026-0928-102 (3 units A+, 1 unit A- compatible).',
    requestId: 'req-102'
  }
];

export const INITIAL_USERS: SystemUser[] = [
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


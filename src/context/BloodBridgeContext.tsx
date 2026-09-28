import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  BloodBank,
  Hospital,
  Donor,
  BloodRequest,
  AuditLog,
  BloodGroup,
  BloodComponent,
  UrgencyLevel,
  RequestStatus,
  MatchStep,
  NotificationItem,
  SystemUser,
  DonationRecord,
  Coordinates,
  DemandAnalytics,
  InventoryAnalytics,
  ShortageReport
} from '../types/bloodbridge';
import {
  INITIAL_BLOOD_BANKS,
  INITIAL_HOSPITALS,
  INITIAL_DONORS,
  INITIAL_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  BLOOD_GROUPS
} from '../utils/mockData';
import { runMatchingEngine, checkDonorEligibility } from '../utils/compatibility';
import {
  bloodRequestApi,
  bloodBankApi,
  donorApi,
  analyticsApi,
  adminApi,
  CreateBloodRequestDto
} from '../services/api';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  hospitalId?: string;
  patientId?: string;
  bloodBankId?: string;
  donorId?: string;
}

interface BloodBridgeContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: UserSession;
  login: (role: UserRole, userDetails?: Partial<UserSession>) => void;
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  bloodBanks: BloodBank[];
  hospitals: Hospital[];
  donors: Donor[];
  requests: BloodRequest[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  systemUsers: SystemUser[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  activeBloodBankId: string;
  setActiveBloodBankId: (id: string) => void;
  activeDonorId: string;
  setActiveDonorId: (id: string) => void;
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;
  isLoading: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;

  // Donor and Admin specific methods
  registerDonor: (donorData: {
    name: string;
    bloodGroup: BloodGroup;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    weightKg: number;
    contactNumber: string;
    city: string;
    email: string;
    preferredHospitalId?: string;
    location: Coordinates;
  }) => Promise<Donor>;
  updateDonorAvailability: (donorId: string, availability: 'AVAILABLE' | 'UNAVAILABLE', notes?: string) => Promise<void>;
  logDonation: (donorId: string, record: Partial<DonationRecord>) => Promise<void>;
  respondToEmergencyRequest: (requestId: string, donorId: string, action: 'ACCEPT' | 'DECLINE') => Promise<void>;
  updateUserStatus: (userId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED') => Promise<void>;
  toggleBankVerification: (bankId: string, verified: boolean, reason?: string) => Promise<void>;
  demandAnalytics: DemandAnalytics | null;
  inventoryAnalytics: InventoryAnalytics | null;
  shortageReport: ShortageReport | null;
  refreshAnalytics: () => Promise<void>;

  createBloodRequest: (params: CreateBloodRequestDto) => Promise<BloodRequest>;
  updateRequestStatus: (requestId: string, status: RequestStatus, note?: string) => Promise<void>;
  refreshRequests: () => Promise<void>;
  refreshBloodBanks: () => Promise<void>;
  updateInventoryUnits: (bankId: string, bloodGroup: BloodGroup, component: BloodComponent, newUnits: number, reason?: string) => Promise<void>;
  respondToDonorAlert: (requestId: string, donorId: string) => void;
  triggerScenario: (scenario: 'MASS_CASUALTY' | 'PLATELET_CRISIS' | 'DONOR_MOBILIZATION' | 'RESET_DEMO') => void;
  previewMatching: (
    bloodGroup: BloodGroup,
    component: BloodComponent,
    unitsNeeded: number,
    hospitalId: string
  ) => {
    matchedSteps: MatchStep[];
    unitsAllocated: number;
    unmetUnits: number;
    eligibleDonorsFound: Donor[];
  };
}

const BloodBridgeContext = createContext<BloodBridgeContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'bloodbridge_demo_v1_';

export const BloodBridgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole>('PATIENT');
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'user-pat-101',
    name: 'Demo Patient 101',
    role: 'PATIENT',
    email: 'patient101@example.com',
    patientId: 'DP-101'
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeBloodBankId, setActiveBloodBankId] = useState<string>('bb-01');
  const [activeDonorId, setActiveDonorId] = useState<string>('donor-01');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}banks`);
    return saved ? JSON.parse(saved) : INITIAL_BLOOD_BANKS;
  });

  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);

  const [donors, setDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}donors`);
    return saved ? JSON.parse(saved) : INITIAL_DONORS;
  });

  const [requests, setRequests] = useState<BloodRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}requests`);
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [demandAnalytics, setDemandAnalytics] = useState<DemandAnalytics | null>(null);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null);
  const [shortageReport, setShortageReport] = useState<ShortageReport | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}banks`, JSON.stringify(bloodBanks));
  }, [bloodBanks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}donors`, JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}requests`, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notifications`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(systemUsers));
  }, [systemUsers]);

  const refreshAnalytics = useCallback(async () => {
    try {
      const [demand, inventory, shortage] = await Promise.all([
        analyticsApi.getDemand(),
        analyticsApi.getInventory(),
        analyticsApi.getShortage()
      ]);
      if (demand) setDemandAnalytics(demand);
      if (inventory) setInventoryAnalytics(inventory);
      if (shortage) setShortageReport(shortage);
    } catch (err) {
      console.warn('Failed to load analytics:', err);
    }
  }, []);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics, requests, bloodBanks]);

  const addAuditLog = useCallback((action: string, details: string, requestId?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      performedBy: currentUser.name,
      role: userRole,
      details,
      requestId
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  }, [currentUser.name, userRole]);

  const addNotification = (title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL', requestId?: string) => {
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      requestId,
      read: false
    };
    setNotifications(prev => [item, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    if (role === 'HOSPITAL') {
      setCurrentUser({
        id: 'user-hosp-01',
        name: 'Dr. Sarah Adams (Trauma OR)',
        role: 'HOSPITAL',
        email: 's.adams@demohospital01.org',
        hospitalId: 'hosp-01'
      });
    } else if (role === 'PATIENT') {
      setCurrentUser({
        id: 'user-pat-101',
        name: 'Demo Patient 101',
        role: 'PATIENT',
        email: 'patient101@example.com',
        patientId: 'DP-101'
      });
    } else if (role === 'BLOOD_BANK_STAFF') {
      setCurrentUser({
        id: 'user-staff-01',
        name: 'Dr. Marcus Vance (Chief Transfusionist)',
        role: 'BLOOD_BANK_STAFF',
        email: 'm.vance@metrobloodbank.org',
        bloodBankId: 'bb-01'
      });
      setActiveBloodBankId('bb-01');
    } else if (role === 'DONOR') {
      const activeDonor = donors.find(d => d.id === activeDonorId) || donors[0];
      setCurrentUser({
        id: activeDonor.id,
        name: activeDonor.name,
        role: 'DONOR',
        email: activeDonor.email || 'donor001@example.com',
        donorId: activeDonor.id
      });
    } else {
      setCurrentUser({
        id: 'user-admin-01',
        name: 'SysAdmin Sarah Miller',
        role: 'ADMIN',
        email: 'admin@bloodbridge.org'
      });
    }
  };

  const login = (role: UserRole, userDetails?: Partial<UserSession>) => {
    setUserRoleState(role);
    const targetTab = role === 'HOSPITAL' 
      ? 'hospital-dashboard' 
      : role === 'BLOOD_BANK_STAFF' 
      ? 'bloodbank-dashboard' 
      : role === 'DONOR'
      ? 'donor-dashboard'
      : role === 'ADMIN'
      ? 'admin-dashboard'
      : 'patient-dashboard';
    
    const assignedBankId = userDetails?.bloodBankId || (role === 'BLOOD_BANK_STAFF' ? (activeBloodBankId || 'bb-01') : undefined);
    if (assignedBankId) {
      setActiveBloodBankId(assignedBankId);
    }

    if (role === 'DONOR') {
      const donorTargetId = userDetails?.donorId || activeDonorId || 'donor-01';
      setActiveDonorId(donorTargetId);
      const matchedDonor = donors.find(d => d.id === donorTargetId) || donors[0];
      setCurrentUser({
        id: matchedDonor.id,
        name: userDetails?.name || matchedDonor.name,
        role: 'DONOR',
        email: userDetails?.email || matchedDonor.email || 'donor@bloodbridge.org',
        donorId: matchedDonor.id
      });
    } else if (role === 'ADMIN') {
      setCurrentUser({
        id: userDetails?.id || 'user-admin-01',
        name: userDetails?.name || 'SysAdmin Sarah Miller',
        role: 'ADMIN',
        email: userDetails?.email || 'admin@bloodbridge.org'
      });
    } else {
      setCurrentUser(prev => ({
        ...prev,
        role,
        id: userDetails?.id || `user-${role.toLowerCase()}`,
        name: userDetails?.name || (role === 'HOSPITAL' ? 'Demo Hospital 01 Staff' : role === 'BLOOD_BANK_STAFF' ? 'Demo Blood Bank Staff' : 'Demo Patient'),
        email: userDetails?.email || `${role.toLowerCase()}@bloodbridge.org`,
        hospitalId: userDetails?.hospitalId || (role === 'HOSPITAL' ? 'hosp-01' : undefined),
        patientId: userDetails?.patientId || (role === 'PATIENT' ? 'DP-101' : undefined),
        bloodBankId: assignedBankId
      }));
    }
    setActiveTab(targetTab);
  };

  const logout = () => {
    setActiveTab('login');
  };

  const refreshBloodBanks = async () => {
    try {
      const data = await bloodBankApi.list();
      if (data && data.bloodBanks) {
        setBloodBanks(data.bloodBanks);
      }
    } catch (err: any) {
      console.warn('API blood banks refresh error:', err);
    }
  };

  const refreshRequests = async () => {
    setIsLoading(true);
    try {
      const data = await bloodRequestApi.list();
      if (data && data.requests) {
        setRequests(data.requests);
      }
    } catch (err: any) {
      console.warn('API refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const previewMatching = (
    bloodGroup: BloodGroup,
    component: BloodComponent,
    unitsNeeded: number,
    hospitalId: string
  ) => {
    const hosp = hospitals.find(h => h.id === hospitalId) || hospitals[0];
    return runMatchingEngine(
      bloodGroup,
      component,
      unitsNeeded,
      hosp.location,
      bloodBanks,
      donors
    );
  };

  const createBloodRequest = async (dto: CreateBloodRequestDto): Promise<BloodRequest> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const created = await bloodRequestApi.create(dto);
      
      // Update local requests state
      setRequests(prev => [created, ...prev.filter(r => r.id !== created.id)]);

      addAuditLog(
        'BLOOD_REQUEST_CREATED',
        `Requisition ${created.requestNumber} logged for ${dto.unitsRequired} units of ${dto.bloodGroup} ${dto.component}. Status: ${created.status}.`,
        created.id
      );

      addNotification(
        `Requisition ${created.requestNumber} Created`,
        `Requisition for ${dto.unitsRequired} units ${dto.bloodGroup} ${dto.component} submitted successfully.`,
        created.urgency === 'CRITICAL' ? 'CRITICAL' : 'INFO',
        created.id
      );

      return created;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create blood request.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, newStatus: RequestStatus, note?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const updated = await bloodRequestApi.updateStatus(requestId, newStatus, note);
      
      setRequests(prev => prev.map(r => r.id === requestId ? updated : r));

      addAuditLog(
        `REQUEST_STATUS_${newStatus}`,
        `Requisition ${requestId} status transitioned to ${newStatus}. ${note || ''}`,
        requestId
      );

      addNotification(
        `Status Updated: ${newStatus}`,
        `Requisition ${updated.requestNumber} is now ${newStatus}. ${note || ''}`,
        newStatus === 'FULFILLED' ? 'SUCCESS' : newStatus === 'CANCELLED' || newStatus === 'REJECTED' ? 'WARNING' : 'INFO',
        requestId
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update request status.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInventoryUnits = async (
    bankId: string,
    bloodGroup: BloodGroup,
    component: BloodComponent,
    newUnits: number,
    reason?: string
  ): Promise<void> => {
    // 1. Validation: Prevent negative units
    if (newUnits < 0 || !Number.isInteger(newUnits)) {
      const msg = 'Negative inventory units are prohibited. Quantity must be a non-negative integer (0 or greater).';
      setErrorMessage(msg);
      throw new Error(msg);
    }

    // 2. Validation: Prevent unauthorized modification of another blood bank
    if (userRole === 'BLOOD_BANK_STAFF' && currentUser.bloodBankId && currentUser.bloodBankId !== bankId) {
      const msg = `Unauthorized modification: you are signed in as staff at ${currentUser.bloodBankId} and cannot alter inventory at ${bankId}.`;
      setErrorMessage(msg);
      throw new Error(msg);
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await bloodBankApi.updateInventory(bankId, {
        bloodGroup,
        component,
        newUnits,
        reason,
        staffBloodBankId: currentUser.bloodBankId
      });

      const now = new Date().toISOString();
      setBloodBanks(prev => prev.map(bank => {
        if (bank.id !== bankId) return bank;
        const key = `${bloodGroup}_${component}`;
        const existing = bank.inventory[key] || {
          bloodGroup,
          component,
          unitsAvailable: 0,
          unitsReserved: 0,
          criticalThreshold: component === 'PRBC' ? 5 : 3,
          expiryWithinDays: component === 'PLATELETS' ? 4 : 28
        };

        const status = newUnits <= 0
          ? 'UNAVAILABLE'
          : newUnits <= existing.criticalThreshold
          ? 'CRITICAL'
          : newUnits <= Math.round(existing.criticalThreshold * 1.5)
          ? 'LOW'
          : 'AVAILABLE';

        return {
          ...bank,
          inventory: {
            ...bank.inventory,
            [key]: {
              ...existing,
              unitsAvailable: newUnits,
              lastUpdated: now,
              status
            }
          }
        };
      }));

      addAuditLog(
        'INVENTORY_MANUAL_ADJUSTMENT',
        `Blood Bank ${bankId} updated ${bloodGroup} ${component} to ${newUnits} available units. Note: ${reason || 'Manual staff adjustment'}`
      );

      addNotification(
        'Inventory Updated',
        `Facility ${bankId}: ${bloodGroup} ${component} stock updated to ${newUnits} units.`,
        'INFO'
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update inventory.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerDonor = async (donorData: {
    name: string;
    bloodGroup: BloodGroup;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    weightKg: number;
    contactNumber: string;
    city: string;
    email: string;
    preferredHospitalId?: string;
    location: Coordinates;
  }): Promise<Donor> => {
    const id = `donor-${Date.now()}`;
    const code = `DD-${Math.floor(100 + Math.random() * 900)}`;
    const newDonor: Donor = {
      id,
      code,
      name: donorData.name,
      bloodGroup: donorData.bloodGroup,
      age: donorData.age,
      gender: donorData.gender,
      weightKg: donorData.weightKg,
      contactNumber: donorData.contactNumber,
      city: donorData.city,
      email: donorData.email,
      preferredHospitalId: donorData.preferredHospitalId,
      location: donorData.location,
      lastDonationDate: '',
      totalDonations: 0,
      isEligible: true,
      status: 'AVAILABLE',
      availability: 'AVAILABLE',
      badges: ['New Volunteer Hero'],
      donationHistory: []
    };

    setDonors(prev => [newDonor, ...prev]);
    setActiveDonorId(newDonor.id);
    addAuditLog(
      'DONOR_REGISTERED',
      `New volunteer donor ${newDonor.name} (${newDonor.bloodGroup}) registered into the regional emergency standby grid.`
    );

    addNotification(
      'Volunteer Donor Registered',
      `Welcome to BloodBridge, ${newDonor.name}! You are registered on standby for emergency blood needs.`,
      'SUCCESS'
    );

    try {
      await fetch('/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDonor)
      });
    } catch (e) {
      console.warn('Backend sync failed, stored locally in state:', e);
    }

    return newDonor;
  };

  const updateDonorAvailability = async (donorId: string, availability: 'AVAILABLE' | 'UNAVAILABLE', notes?: string) => {
    try {
      await donorApi.updateAvailability(donorId, availability, notes);
    } catch (e) {
      console.warn(e);
    }

    setDonors(prev => prev.map(d => {
      if (d.id !== donorId) return d;
      const newStatus = availability === 'UNAVAILABLE' ? 'INELIGIBLE' : d.isEligible ? 'AVAILABLE' : 'COOLDOWN';
      return {
        ...d,
        availability,
        status: newStatus
      };
    }));

    addAuditLog(
      'DONOR_AVAILABILITY_CHANGED',
      `Donor ${donorId} updated availability status to ${availability}. ${notes || ''}`
    );

    addNotification(
      'Availability Status Updated',
      `Your donor status is now set to ${availability}.`,
      availability === 'AVAILABLE' ? 'SUCCESS' : 'WARNING'
    );
  };

  const logDonation = async (donorId: string, record: Partial<DonationRecord>) => {
    const donor = donors.find(d => d.id === donorId);
    if (!donor) return;

    const newRecord: DonationRecord = {
      id: `don-rec-${Date.now()}`,
      donorId,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      component: record.component || 'PRBC',
      unitsDonated: record.unitsDonated || 1,
      donationDate: record.donationDate || new Date().toISOString(),
      facilityName: record.facilityName || 'Demo Blood Bank 01 - Metro Central',
      facilityType: record.facilityType || 'BLOOD_BANK',
      facilityId: record.facilityId || 'bb-01',
      status: 'COMPLETED',
      vitals: record.vitals || { hemoglobinGdl: 14.5, bloodPressure: '120/80', pulseBpm: 72, weightKg: donor.weightKg },
      certificateId: `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      notes: record.notes || 'Donation session completed safely'
    };

    try {
      await donorApi.addHistory(donorId, newRecord);
    } catch (e) {
      console.warn(e);
    }

    setDonors(prev => prev.map(d => {
      if (d.id !== donorId) return d;
      const history = d.donationHistory || [];
      return {
        ...d,
        totalDonations: d.totalDonations + (newRecord.unitsDonated || 1),
        lastDonationDate: newRecord.donationDate,
        status: 'COOLDOWN',
        isEligible: false,
        donationHistory: [newRecord, ...history]
      };
    }));

    addAuditLog(
      'DONATION_RECORD_LOGGED',
      `New donation record logged for ${donor.name}: ${newRecord.unitsDonated} unit(s) ${newRecord.bloodGroup} ${newRecord.component} at ${newRecord.facilityName}.`
    );

    addNotification(
      'Donation Recorded Successfully',
      `Heroic contribution! Certificate ${newRecord.certificateId} generated. Mandatory 56-day cooldown initiated.`,
      'SUCCESS'
    );
  };

  const respondToEmergencyRequest = async (requestId: string, donorId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      await donorApi.respondToMatch(requestId, 'match-01', action, donorId);
    } catch (e) {
      console.warn(e);
    }
    const donor = donors.find(d => d.id === donorId);
    if (!donor) return;

    if (action === 'ACCEPT') {
      setRequests(prev => prev.map(req => {
        if (req.id !== requestId) return req;
        const currentAccepted = req.donorAlertsAccepted || 0;
        const newAllocated = Math.min(req.unitsRequired || req.unitsNeeded, req.unitsAllocated + 1);
        const isNowFullyAllocated = newAllocated >= (req.unitsRequired || req.unitsNeeded);

        return {
          ...req,
          donorAlertsAccepted: currentAccepted + 1,
          unitsAllocated: newAllocated,
          status: isNowFullyAllocated ? 'RESERVED' : req.status === 'SEARCHING' ? 'ACCEPTED' : req.status
        };
      }));

      setDonors(prev => prev.map(d => {
        if (d.id !== donorId) return d;
        return {
          ...d,
          status: 'ON_CALL'
        };
      }));

      addAuditLog(
        'DONOR_RESPONSE_ACCEPTED',
        `${donor.name} (${donor.bloodGroup}) accepted emergency donation request ${requestId}. Status updated to ON_CALL.`,
        requestId
      );

      addNotification(
        'Emergency Call Accepted',
        `Thank you ${donor.name}! Your acceptance for emergency requisition ${requestId} was transmitted to hospital triage. Status: ON_CALL.`,
        'SUCCESS',
        requestId
      );
    } else {
      addAuditLog(
        'DONOR_RESPONSE_DECLINED',
        `${donor.name} (${donor.bloodGroup}) declined emergency donation request ${requestId}.`,
        requestId
      );

      addNotification(
        'Emergency Call Declined',
        `Your decline response for requisition ${requestId} was noted. You remain available for other calls.`,
        'INFO',
        requestId
      );
    }
  };

  const updateUserStatus = async (userId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED') => {
    try {
      await adminApi.updateUser(userId, { status });
    } catch (e) {
      console.warn(e);
    }

    setSystemUsers(prev => prev.map(u => u.id === userId ? { ...u, status, lastActive: 'Just now' } : u));

    addAuditLog(
      'ADMIN_USER_STATUS_UPDATED',
      `Admin updated user ${userId} account status to ${status}.`
    );

    addNotification(
      'User Status Updated',
      `User ${userId} status changed to ${status}.`,
      'INFO'
    );
  };

  const toggleBankVerification = async (bankId: string, verified: boolean, reason?: string) => {
    try {
      await adminApi.updateBankVerification(bankId, verified, reason, currentUser.name);
    } catch (e) {
      console.warn(e);
    }

    setBloodBanks(prev => prev.map(b => b.id === bankId ? { ...b, verified } : b));

    addAuditLog(
      'ADMIN_FACILITY_VERIFICATION_TOGGLE',
      `Blood Bank ${bankId} verification status set to ${verified ? 'VERIFIED' : 'UNVERIFIED'}. Reason: ${reason || 'Admin review'}`
    );

    addNotification(
      'Facility Verification Updated',
      `Blood Bank ${bankId} is now ${verified ? 'VERIFIED' : 'UNVERIFIED'}.`,
      verified ? 'SUCCESS' : 'WARNING'
    );
  };

  const respondToDonorAlert = (requestId: string, donorId: string) => {
    respondToEmergencyRequest(requestId, donorId, 'ACCEPT');
  };

  const triggerScenario = (scenario: 'MASS_CASUALTY' | 'PLATELET_CRISIS' | 'DONOR_MOBILIZATION' | 'RESET_DEMO') => {
    if (scenario === 'RESET_DEMO') {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}banks`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}donors`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}requests`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}logs`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}notifications`);
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}users`);
      setBloodBanks(INITIAL_BLOOD_BANKS);
      setDonors(INITIAL_DONORS);
      setRequests(INITIAL_REQUESTS);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setSystemUsers(INITIAL_USERS);
      refreshAnalytics();
      return;
    }

    if (scenario === 'MASS_CASUALTY') {
      createBloodRequest({
        patientName: 'Demo Trauma Victim Alpha',
        hospitalId: 'hosp-01',
        hospitalName: 'Demo Hospital 01 - City Emergency Trauma Center',
        requesterRole: 'HOSPITAL',
        bloodGroup: 'O-',
        component: 'PRBC',
        unitsRequired: 4,
        urgency: 'CRITICAL',
        requiredDateTime: new Date(Date.now() + 30 * 60000).toISOString(),
        location: {
          hospitalName: 'Demo Hospital 01',
          address: '1001 Potrero Ave, San Francisco',
          lat: 37.7558,
          lng: -122.4045
        },
        contactInformation: {
          contactPerson: 'Lead Trauma Attending',
          phoneNumber: '+1 (555) 012-7001',
          relationship: 'Trauma Unit'
        },
        clinicalReason: 'Highway collision multi-trauma, open pelvic fracture, severe blood loss',
        additionalNotes: 'Simulated Mass Casualty Scenario Event'
      });
      setActiveTab('hospital-dashboard');
    }

    if (scenario === 'PLATELET_CRISIS') {
      createBloodRequest({
        patientName: 'Demo Oncology Patient Theta',
        hospitalId: 'hosp-04',
        hospitalName: 'Demo Hospital 04 - Westside Pediatric & Surgical Center',
        requesterRole: 'HOSPITAL',
        bloodGroup: 'O+',
        component: 'PLATELETS',
        unitsRequired: 5,
        urgency: 'HIGH',
        requiredDateTime: new Date(Date.now() + 120 * 60000).toISOString(),
        location: {
          hospitalName: 'Demo Hospital 04',
          address: '1600 Divisadero St, San Francisco',
          lat: 37.7845,
          lng: -122.4402
        },
        contactInformation: {
          contactPerson: 'Dr. Evans',
          phoneNumber: '+1 (555) 012-7004',
          relationship: 'Pediatric Oncology'
        },
        clinicalReason: 'Simulated regional platelet shortage spike',
        additionalNotes: 'Depleted regional bank reserves'
      });
      setActiveTab('hospital-dashboard');
    }

    if (scenario === 'DONOR_MOBILIZATION') {
      const openReq = requests.find(r => r.donorAlertsSent && r.donorAlertsSent > (r.donorAlertsAccepted || 0));
      if (openReq) {
        const eligibleDonor = donors.find(d => d.isEligible && d.status === 'AVAILABLE');
        if (eligibleDonor) {
          respondToDonorAlert(openReq.id, eligibleDonor.id);
        }
      }
    }
  };

  return (
    <BloodBridgeContext.Provider
      value={{
        userRole,
        setUserRole,
        currentUser,
        login,
        logout,
        activeTab,
        setActiveTab,
        bloodBanks,
        hospitals,
        donors,
        requests,
        auditLogs,
        notifications,
        systemUsers,
        unreadNotificationCount,
        markNotificationAsRead,
        clearNotifications,
        activeBloodBankId,
        setActiveBloodBankId,
        activeDonorId,
        setActiveDonorId,
        selectedRequestId,
        setSelectedRequestId,
        isLoading,
        errorMessage,
        setErrorMessage,
        registerDonor,
        updateDonorAvailability,
        logDonation,
        respondToEmergencyRequest,
        updateUserStatus,
        toggleBankVerification,
        demandAnalytics,
        inventoryAnalytics,
        shortageReport,
        refreshAnalytics,
        createBloodRequest,
        updateRequestStatus,
        refreshRequests,
        refreshBloodBanks,
        updateInventoryUnits,
        respondToDonorAlert,
        triggerScenario,
        previewMatching
      }}
    >
      {children}
    </BloodBridgeContext.Provider>
  );
};

export const useBloodBridge = () => {
  const context = useContext(BloodBridgeContext);
  if (!context) {
    throw new Error('useBloodBridge must be used within a BloodBridgeProvider');
  }
  return context;
};

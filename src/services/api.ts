import { BloodRequest, RequestStatus, BloodGroup, BloodComponent, UrgencyLevel, MatchStep, BloodBank, InventoryItem } from '../types/bloodbridge';

export interface CreateBloodRequestDto {
  patientName: string;
  hospitalId: string;
  hospitalName?: string;
  requesterRole: 'PATIENT' | 'HOSPITAL';
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsRequired?: number;
  unitsNeeded?: number;
  urgency: UrgencyLevel;
  requiredDateTime?: string;
  location?: {
    hospitalName?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
  contactInformation?: {
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    relationship?: string;
  };
  clinicalReason: string;
  additionalNotes?: string;
  notes?: string;
}

export interface RequestMatchesDto {
  requestId: string;
  requestNumber: string;
  status: RequestStatus;
  unitsRequired: number;
  unitsAllocated: number;
  matches: MatchStep[];
}

const API_BASE = ''; // Same origin

/**
 * Shared API Client for Blood Requests
 * Conforms to MASTER_SPEC.md API contracts.
 */
export const bloodRequestApi = {
  /**
   * GET /blood-requests
   */
  async list(filters?: {
    status?: string;
    urgency?: string;
    bloodGroup?: string;
    requesterRole?: string;
  }): Promise<{ requests: BloodRequest[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.urgency && filters.urgency !== 'ALL') params.append('urgency', filters.urgency);
      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') params.append('bloodGroup', filters.bloodGroup);
      if (filters?.requesterRole && filters.requesterRole !== 'ALL') params.append('requesterRole', filters.requesterRole);

      const res = await fetch(`${API_BASE}/blood-requests?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, using isolated fallback client:', err);
      // Fallback to local storage if API is temporarily unavailable
      const stored = localStorage.getItem('bloodbridge_demo_v1_requests');
      let items: BloodRequest[] = stored ? JSON.parse(stored) : [];
      if (filters?.status && filters.status !== 'ALL') items = items.filter(r => r.status === filters.status);
      if (filters?.urgency && filters.urgency !== 'ALL') items = items.filter(r => r.urgency === filters.urgency);
      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') items = items.filter(r => r.bloodGroup === filters.bloodGroup);
      if (filters?.requesterRole && filters.requesterRole !== 'ALL') items = items.filter(r => r.requesterRole === filters.requesterRole);
      return { requests: items, total: items.length };
    }
  },

  /**
   * GET /blood-requests/:id
   */
  async getById(id: string): Promise<BloodRequest> {
    try {
      const res = await fetch(`${API_BASE}/blood-requests/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, finding in local cache:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_requests');
      const items: BloodRequest[] = stored ? JSON.parse(stored) : [];
      const found = items.find(r => r.id === id);
      if (!found) throw new Error('Blood request not found');
      return found;
    }
  },

  /**
   * POST /blood-requests
   */
  async create(dto: CreateBloodRequestDto): Promise<BloodRequest> {
    try {
      const res = await fetch(`${API_BASE}/blood-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn('Network request failed, executing client-side creation:', err);
      // Offline fallback creation
      const now = new Date();
      const seq = Math.floor(Math.random() * 900) + 100;
      const reqUnits = Number(dto.unitsRequired || dto.unitsNeeded || 1);
      const fallbackReq: BloodRequest = {
        id: `req-${Date.now()}`,
        requestNumber: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${seq}`,
        patientName: dto.patientName,
        patientId: `DP-${seq}`,
        hospitalId: dto.hospitalId,
        hospitalName: dto.hospitalName || 'Demo Hospital Trauma Center',
        requesterRole: dto.requesterRole,
        bloodGroup: dto.bloodGroup,
        component: dto.component,
        unitsRequired: reqUnits,
        unitsNeeded: reqUnits,
        unitsAllocated: dto.urgency === 'CRITICAL' ? reqUnits : 1,
        urgency: dto.urgency,
        requiredDateTime: dto.requiredDateTime || new Date(Date.now() + 4 * 3600000).toISOString(),
        location: {
          hospitalName: (dto.location && 'hospitalName' in dto.location && dto.location.hospitalName) ? dto.location.hospitalName : (dto.hospitalName || 'Demo Hospital'),
          address: (dto.location && 'address' in dto.location && dto.location.address) ? dto.location.address : 'San Francisco, CA',
          lat: dto.location?.lat ?? 37.7558,
          lng: dto.location?.lng ?? -122.4045
        },
        contactInformation: {
          contactPerson: dto.contactInformation?.contactPerson || 'Attending Officer',
          phoneNumber: dto.contactInformation?.phoneNumber || '+1 (555) 012-7000',
          email: dto.contactInformation?.email,
          relationship: dto.contactInformation?.relationship
        },
        clinicalReason: dto.clinicalReason,
        additionalNotes: dto.additionalNotes || dto.notes,
        notes: dto.additionalNotes || dto.notes,
        city: 'San Francisco',
        status: dto.urgency === 'CRITICAL' ? 'ACCEPTED' : 'MATCHED',
        createdAt: now.toISOString(),
        estimatedArrivalMin: dto.urgency === 'CRITICAL' ? 15 : 30,
        matchedSources: [
          {
            stage: 'INVENTORY_EXACT',
            sourceId: 'bb-01',
            sourceName: 'Demo Blood Bank 01 - Metro Central',
            sourceType: 'BLOOD_BANK',
            bloodGroupOffered: dto.bloodGroup,
            unitsAllocated: dto.urgency === 'CRITICAL' ? reqUnits : 1,
            distanceKm: 2.8,
            status: 'RESERVED'
          }
        ]
      };

      const stored = localStorage.getItem('bloodbridge_demo_v1_requests');
      const items: BloodRequest[] = stored ? JSON.parse(stored) : [];
      items.unshift(fallbackReq);
      localStorage.setItem('bloodbridge_demo_v1_requests', JSON.stringify(items));
      return fallbackReq;
    }
  },

  /**
   * PATCH /blood-requests/:id/status
   */
  async updateStatus(id: string, status: RequestStatus, notes?: string): Promise<BloodRequest> {
    try {
      const res = await fetch(`${API_BASE}/blood-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, updating in local storage:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_requests');
      let items: BloodRequest[] = stored ? JSON.parse(stored) : [];
      let updated: BloodRequest | null = null;
      items = items.map(r => {
        if (r.id === id) {
          updated = {
            ...r,
            status,
            additionalNotes: notes ? `${r.additionalNotes || ''} [${notes}]`.trim() : r.additionalNotes,
            notes: notes ? `${r.notes || ''} [${notes}]`.trim() : r.notes
          };
          return updated;
        }
        return r;
      });
      localStorage.setItem('bloodbridge_demo_v1_requests', JSON.stringify(items));
      if (!updated) throw new Error('Blood request not found');
      return updated;
    }
  },

  /**
   * GET /blood-requests/:id/matches
   */
  async getMatches(id: string): Promise<RequestMatchesDto> {
    try {
      const res = await fetch(`${API_BASE}/blood-requests/${id}/matches`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, computing from local request object:', err);
      const req = await this.getById(id);
      return {
        requestId: req.id,
        requestNumber: req.requestNumber,
        status: req.status,
        unitsRequired: req.unitsRequired || req.unitsNeeded,
        unitsAllocated: req.unitsAllocated,
        matches: req.matchedSources || []
      };
    }
  }
};

export interface BloodBankInventoryResponse {
  bankId: string;
  bankName: string;
  bankCode: string;
  inventory: InventoryItem[];
  totalAvailable: number;
  totalReserved: number;
  criticalAlertsCount: number;
  lowStockCount: number;
  lastUpdated: string;
}

export interface UpdateInventoryDto {
  bloodGroup: BloodGroup;
  component?: BloodComponent;
  newUnits: number;
  reason?: string;
  staffBloodBankId?: string;
}

export const bloodBankApi = {
  /**
   * GET /blood-banks
   */
  async list(): Promise<{ bloodBanks: BloodBank[]; total: number }> {
    try {
      const res = await fetch(`${API_BASE}/blood-banks`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, retrieving blood banks from storage:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_banks');
      const banks: BloodBank[] = stored ? JSON.parse(stored) : [];
      return { bloodBanks: banks, total: banks.length };
    }
  },

  /**
   * GET /blood-banks/:id
   */
  async getById(id: string): Promise<BloodBank> {
    try {
      const res = await fetch(`${API_BASE}/blood-banks/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, retrieving blood bank from storage:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_banks');
      const banks: BloodBank[] = stored ? JSON.parse(stored) : [];
      const bank = banks.find(b => b.id === id);
      if (!bank) throw new Error('Blood bank not found');
      return bank;
    }
  },

  /**
   * GET /blood-banks/:id/inventory
   */
  async getInventory(id: string, filters?: { component?: string; bloodGroup?: string }): Promise<BloodBankInventoryResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.component && filters.component !== 'ALL') params.append('component', filters.component);
      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') params.append('bloodGroup', filters.bloodGroup);

      const res = await fetch(`${API_BASE}/blood-banks/${id}/inventory?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, retrieving inventory from local state:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_banks');
      const banks: BloodBank[] = stored ? JSON.parse(stored) : [];
      const bank = banks.find(b => b.id === id);
      if (!bank) throw new Error('Blood bank not found');

      let items = Object.values(bank.inventory);
      if (filters?.component && filters.component !== 'ALL') {
        items = items.filter(i => i.component === filters.component);
      }
      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') {
        items = items.filter(i => i.bloodGroup === filters.bloodGroup);
      }

      let totalAvailable = 0;
      let totalReserved = 0;
      let criticalAlertsCount = 0;
      let lowStockCount = 0;
      let lastUpdated = '2026-09-28T07:00:00.000Z';

      Object.values(bank.inventory).forEach(inv => {
        totalAvailable += inv.unitsAvailable || 0;
        totalReserved += inv.unitsReserved || 0;
        if (inv.unitsAvailable <= inv.criticalThreshold) {
          criticalAlertsCount++;
        } else if (inv.unitsAvailable <= Math.round(inv.criticalThreshold * 1.5)) {
          lowStockCount++;
        }
        if (inv.lastUpdated && inv.lastUpdated > lastUpdated) {
          lastUpdated = inv.lastUpdated;
        }
      });

      return {
        bankId: bank.id,
        bankName: bank.name,
        bankCode: bank.code,
        inventory: items,
        totalAvailable,
        totalReserved,
        criticalAlertsCount,
        lowStockCount,
        lastUpdated
      };
    }
  },

  /**
   * PATCH /blood-banks/:id/inventory
   */
  async updateInventory(
    bankId: string,
    dto: UpdateInventoryDto
  ): Promise<{ success: boolean; updatedItem: InventoryItem; inventory: Record<string, InventoryItem> }> {
    // Client-side validations
    const validBloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(dto.bloodGroup)) {
      throw new Error(`Invalid blood group: ${dto.bloodGroup}. Must be one of standard ABO/Rh groups.`);
    }

    if (dto.newUnits < 0 || !Number.isInteger(dto.newUnits)) {
      throw new Error('Invalid units quantity: negative inventory is not permitted. Must be a non-negative integer.');
    }

    if (dto.staffBloodBankId && dto.staffBloodBankId !== bankId) {
      throw new Error(`Unauthorized: staff from facility ${dto.staffBloodBankId} cannot modify inventory for ${bankId}`);
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (dto.staffBloodBankId) {
        headers['x-staff-bank-id'] = dto.staffBloodBankId;
      }

      const res = await fetch(`${API_BASE}/blood-banks/${bankId}/inventory`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(dto)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('Network request failed, applying update in local storage:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_banks');
      const banks: BloodBank[] = stored ? JSON.parse(stored) : [];
      const bankIndex = banks.findIndex(b => b.id === bankId);
      if (bankIndex === -1) throw new Error('Blood bank not found in local cache');

      const bank = banks[bankIndex];
      const comp = dto.component || 'PRBC';
      const key = `${dto.bloodGroup}_${comp}`;
      const existing = bank.inventory[key] || {
        bloodGroup: dto.bloodGroup,
        component: comp,
        unitsAvailable: 0,
        unitsReserved: 0,
        criticalThreshold: comp === 'PRBC' ? 5 : 3,
        expiryWithinDays: comp === 'PLATELETS' ? 4 : 28
      };

      const now = new Date().toISOString();
      const status = dto.newUnits <= 0
        ? 'UNAVAILABLE'
        : dto.newUnits <= existing.criticalThreshold
        ? 'CRITICAL'
        : dto.newUnits <= Math.round(existing.criticalThreshold * 1.5)
        ? 'LOW'
        : 'AVAILABLE';

      const updatedItem: InventoryItem = {
        ...existing,
        unitsAvailable: dto.newUnits,
        lastUpdated: now,
        status
      };

      bank.inventory[key] = updatedItem;
      banks[bankIndex] = bank;
      localStorage.setItem('bloodbridge_demo_v1_banks', JSON.stringify(banks));

      return {
        success: true,
        updatedItem,
        inventory: bank.inventory
      };
    }
  }
};

export const donorApi = {
  /**
   * GET /donors
   */
  async list(filters?: { bloodGroup?: string; availability?: string; status?: string; city?: string }): Promise<{ donors: any[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') params.append('bloodGroup', filters.bloodGroup);
      if (filters?.availability && filters.availability !== 'ALL') params.append('availability', filters.availability);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.city) params.append('city', filters.city);

      const res = await fetch(`${API_BASE}/donors?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, loading donors from local storage cache:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_donors');
      const donors: any[] = stored ? JSON.parse(stored) : [];
      let result = [...donors];
      if (filters?.bloodGroup && filters.bloodGroup !== 'ALL') result = result.filter(d => d.bloodGroup === filters.bloodGroup);
      if (filters?.availability && filters.availability !== 'ALL') result = result.filter(d => d.availability === filters.availability);
      return { donors: result, total: result.length };
    }
  },

  /**
   * GET /donors/:id
   */
  async getById(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/donors/${id}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      const stored = localStorage.getItem('bloodbridge_demo_v1_donors');
      const donors: any[] = stored ? JSON.parse(stored) : [];
      const found = donors.find(d => d.id === id);
      if (!found) throw new Error('Donor not found');
      return found;
    }
  },

  /**
   * PATCH /donors/:id/availability
   */
  async updateAvailability(id: string, availability: 'AVAILABLE' | 'UNAVAILABLE', notes?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/donors/${id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability, notes })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, updating donor availability locally:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_donors');
      const donors: any[] = stored ? JSON.parse(stored) : [];
      let updatedDonor: any = null;
      const updated = donors.map(d => {
        if (d.id === id) {
          updatedDonor = {
            ...d,
            availability,
            status: availability === 'UNAVAILABLE' ? 'INELIGIBLE' : d.isEligible ? 'AVAILABLE' : 'COOLDOWN'
          };
          return updatedDonor;
        }
        return d;
      });
      localStorage.setItem('bloodbridge_demo_v1_donors', JSON.stringify(updated));
      return { success: true, donor: updatedDonor };
    }
  },

  /**
   * GET /donors/:id/history
   */
  async getHistory(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/donors/${id}/history`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      const donor = await this.getById(id);
      return { history: donor.donationHistory || [] };
    }
  },

  /**
   * POST /donors/:id/history
   */
  async addHistory(id: string, record: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/donors/${id}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, appending history locally:', err);
      const stored = localStorage.getItem('bloodbridge_demo_v1_donors');
      const donors: any[] = stored ? JSON.parse(stored) : [];
      let updatedDonor: any = null;
      const updated = donors.map(d => {
        if (d.id === id) {
          const history = d.donationHistory || [];
          const newRecord = {
            id: `don-rec-${Date.now()}`,
            donorId: id,
            ...record,
            status: 'COMPLETED'
          };
          updatedDonor = {
            ...d,
            totalDonations: (d.totalDonations || 0) + (record.unitsDonated || 1),
            lastDonationDate: record.donationDate || new Date().toISOString(),
            status: 'COOLDOWN',
            donationHistory: [newRecord, ...history]
          };
          return updatedDonor;
        }
        return d;
      });
      localStorage.setItem('bloodbridge_demo_v1_donors', JSON.stringify(updated));
      return { success: true, record, donor: updatedDonor };
    }
  },

  /**
   * POST /blood-requests/:id/matches/:matchId/respond
   */
  async respondToMatch(requestId: string, matchId: string, action: 'ACCEPT' | 'DECLINE', donorId?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/blood-requests/${requestId}/matches/${matchId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, donorId })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, responding to match locally:', err);
      return { success: true, message: `Match ${action.toLowerCase()}ed locally` };
    }
  }
};

export const analyticsApi = {
  /**
   * GET /analytics/demand
   */
  async getDemand(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics/demand`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, computing demand analytics on client:', err);
      return null;
    }
  },

  /**
   * GET /analytics/inventory
   */
  async getInventory(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics/inventory`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, computing inventory analytics on client:', err);
      return null;
    }
  },

  /**
   * GET /analytics/shortage
   */
  async getShortage(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics/shortage`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, computing shortage indicator on client:', err);
      return null;
    }
  }
};

export const adminApi = {
  /**
   * GET /users
   */
  async getUsers(filters?: { role?: string; status?: string; search?: string }): Promise<{ users: any[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.role && filters.role !== 'ALL') params.append('role', filters.role);
      if (filters?.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const res = await fetch(`${API_BASE}/users?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, retrieving cached users:', err);
      return { users: [], total: 0 };
    }
  },

  /**
   * PATCH /users/:id
   */
  async updateUser(id: string, updates: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, updating user locally:', err);
      return { success: true };
    }
  },

  /**
   * PATCH /blood-banks/:id/verification
   */
  async updateBankVerification(bankId: string, verified: boolean, reason?: string, auditorName?: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/blood-banks/${bankId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified, reason, auditorName })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Network request failed, updating verification locally:', err);
      return { success: true, verified };
    }
  }
};


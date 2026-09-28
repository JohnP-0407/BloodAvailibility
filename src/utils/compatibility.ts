import { BloodGroup, BloodComponent, BloodBank, Donor, MatchStep, CompatibilityInfo } from '../types/bloodbridge';

/**
 * DETERMINISTIC CLINICAL COMPATIBILITY MATRIX
 * Authoritative medical safety rule: Predefined deterministic rules only.
 * No probabilistic or generative AI logic is ever applied to blood compatibility.
 */

// Red Blood Cells (PRBC) & Whole Blood Compatibility (Recipient -> Compatible Donors)
export const RBC_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-']
};

// Plasma (FFP) & Cryoprecipitate Compatibility (Recipient -> Compatible Donors)
// Notice in plasma, AB is the universal donor because plasma has no anti-A or anti-B antibodies.
export const PLASMA_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
};

/**
 * Checks whether donorBlood is clinically compatible with recipientBlood for a given component.
 */
export function isBloodCompatible(
  recipientBlood: BloodGroup,
  donorBlood: BloodGroup,
  component: BloodComponent
): boolean {
  if (component === 'FFP' || component === 'CRYOPRECIPITATE') {
    return PLASMA_COMPATIBILITY_MAP[recipientBlood]?.includes(donorBlood) ?? false;
  }
  // PRBC, WHOLE_BLOOD, and PLATELETS prioritize RBC compatibility rules for emergency protocol
  return RBC_COMPATIBILITY_MAP[recipientBlood]?.includes(donorBlood) ?? false;
}

/**
 * Returns all compatible donor blood groups for a given recipient.
 */
export function getCompatibleDonorGroups(
  recipientBlood: BloodGroup,
  component: BloodComponent
): BloodGroup[] {
  if (component === 'FFP' || component === 'CRYOPRECIPITATE') {
    return PLASMA_COMPATIBILITY_MAP[recipientBlood] || [recipientBlood];
  }
  return RBC_COMPATIBILITY_MAP[recipientBlood] || [recipientBlood];
}

/**
 * Returns comprehensive deterministic compatibility info for a blood group.
 */
export function getBloodCompatibility(bloodGroup: BloodGroup): CompatibilityInfo {
  const allGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const canReceiveFrom = RBC_COMPATIBILITY_MAP[bloodGroup] || [bloodGroup];
  const canDonateTo = allGroups.filter(g => RBC_COMPATIBILITY_MAP[g]?.includes(bloodGroup));

  return {
    canReceiveFrom,
    canDonateTo,
    isUniversalDonorRbc: bloodGroup === 'O-',
    isUniversalRecipientRbc: bloodGroup === 'AB+',
    isUniversalDonorPlasma: bloodGroup === 'AB+',
    isUniversalRecipientPlasma: bloodGroup === 'O-'
  };
}

/**
 * Haversine formula to compute great-circle distance between two coordinates in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Deterministic Donor Eligibility Verification
 * Checks minimum days since last donation, age, weight.
 */
export function checkDonorEligibility(
  donor: Donor,
  targetDate: Date = new Date()
): { eligible: boolean; reason: string; daysRemaining: number } {
  if (donor.age < 18 || donor.age > 65) {
    return { eligible: false, reason: 'Donor age must be between 18 and 65 years.', daysRemaining: 0 };
  }
  if (donor.weightKg < 50) {
    return { eligible: false, reason: 'Donor weight must be at least 50 kg (110 lbs).', daysRemaining: 0 };
  }

  if (!donor.lastDonationDate) {
    return { eligible: true, reason: 'Eligible: first-time voluntary donor.', daysRemaining: 0 };
  }

  const lastDonation = new Date(donor.lastDonationDate);
  const diffTime = targetDate.getTime() - lastDonation.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const REQUIRED_COOLDOWN_DAYS = 56; // 8 weeks standard for whole blood

  if (diffDays < REQUIRED_COOLDOWN_DAYS) {
    const daysRemaining = REQUIRED_COOLDOWN_DAYS - diffDays;
    return {
      eligible: false,
      reason: `Mandatory interval cooldown active. ${daysRemaining} days remaining before safe donation.`,
      daysRemaining
    };
  }

  return { eligible: true, reason: 'Medically eligible for blood donation.', daysRemaining: 0 };
}

/**
 * DETERMINISTIC MULTI-STAGE MATCHING ENGINE
 * 
 * 1. Checks nearest blood bank for exact match.
 * 2. Checks nearest blood bank for compatible match.
 * 3. Expands to partner blood banks in order of distance.
 * 4. If shortfall remains: queries registered eligible donors of compatible blood groups.
 */
export function runMatchingEngine(
  recipientBlood: BloodGroup,
  component: BloodComponent,
  unitsNeeded: number,
  hospitalCoords: { lat: number; lng: number },
  bloodBanks: BloodBank[],
  donors: Donor[]
): {
  matchedSteps: MatchStep[];
  unitsAllocated: number;
  unmetUnits: number;
  eligibleDonorsFound: Donor[];
} {
  let remainingUnits = unitsNeeded;
  const matchedSteps: MatchStep[] = [];
  const compatibleGroups = getCompatibleDonorGroups(recipientBlood, component);

  // Sort blood banks by distance from hospital
  const sortedBanks = [...bloodBanks].map(bank => ({
    bank,
    distanceKm: calculateDistanceKm(
      hospitalCoords.lat,
      hospitalCoords.lng,
      bank.location.lat,
      bank.location.lng
    )
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  // STAGE 1: Exact group match in closest blood bank
  for (const item of sortedBanks) {
    if (remainingUnits <= 0) break;
    const invKey = `${recipientBlood}_${component}`;
    const invItem = item.bank.inventory[invKey];

    if (invItem && invItem.unitsAvailable > 0) {
      const takeUnits = Math.min(invItem.unitsAvailable, remainingUnits);
      remainingUnits -= takeUnits;
      matchedSteps.push({
        stage: 'INVENTORY_EXACT',
        sourceId: item.bank.id,
        sourceName: item.bank.name,
        sourceType: 'BLOOD_BANK',
        bloodGroupOffered: recipientBlood,
        unitsAllocated: takeUnits,
        distanceKm: item.distanceKm,
        status: 'RESERVED'
      });
    }
  }

  // STAGE 2: Compatible group match from blood banks (e.g. O- for A+) if shortfall remains
  if (remainingUnits > 0) {
    for (const item of sortedBanks) {
      if (remainingUnits <= 0) break;
      for (const group of compatibleGroups) {
        if (group === recipientBlood) continue; // already evaluated in Stage 1
        if (remainingUnits <= 0) break;

        const invKey = `${group}_${component}`;
        const invItem = item.bank.inventory[invKey];

        if (invItem && invItem.unitsAvailable > 0) {
          const takeUnits = Math.min(invItem.unitsAvailable, remainingUnits);
          remainingUnits -= takeUnits;
          matchedSteps.push({
            stage: 'INVENTORY_COMPATIBLE',
            sourceId: item.bank.id,
            sourceName: item.bank.name,
            sourceType: 'BLOOD_BANK',
            bloodGroupOffered: group,
            unitsAllocated: takeUnits,
            distanceKm: item.distanceKm,
            status: 'RESERVED'
          });
        }
      }
    }
  }

  // STAGE 3: If still shortfall, locate eligible registered donors
  const eligibleDonorsFound: Donor[] = [];
  if (remainingUnits > 0) {
    const sortedDonors = donors
      .filter(d => compatibleGroups.includes(d.bloodGroup))
      .filter(d => checkDonorEligibility(d).eligible)
      .map(d => ({
        donor: d,
        distanceKm: calculateDistanceKm(
          hospitalCoords.lat,
          hospitalCoords.lng,
          d.location.lat,
          d.location.lng
        )
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    for (const dItem of sortedDonors) {
      eligibleDonorsFound.push(dItem.donor);
      if (remainingUnits > 0) {
        // 1 donor = 1 unit
        matchedSteps.push({
          stage: 'DONOR_DISPATCH',
          sourceId: dItem.donor.id,
          sourceName: `${dItem.donor.name} (${dItem.donor.code})`,
          sourceType: 'DONOR',
          bloodGroupOffered: dItem.donor.bloodGroup,
          unitsAllocated: 1,
          distanceKm: dItem.distanceKm,
          status: 'PENDING'
        });
        remainingUnits -= 1;
      }
    }
  }

  const unitsAllocated = unitsNeeded - Math.max(0, remainingUnits);

  return {
    matchedSteps,
    unitsAllocated,
    unmetUnits: Math.max(0, remainingUnits),
    eligibleDonorsFound
  };
}

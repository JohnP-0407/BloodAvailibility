# BLOODBRIDGE MASTER SPECIFICATION
**Version:** 1.0.0 (Hackathon Release)  
**Project:** BloodBridge — Smart Blood Availability & Emergency Coordination Platform

---

## 1. System Overview & Vision
BloodBridge connects patients/hospitals, blood banks, and registered donors through a centralized system for blood requests, inventory discovery, deterministic source matching, emergency coordination, and demand analytics.

**CRITICAL MEDICAL SAFETY RULE:**
Deterministic predefined clinical rules ONLY for blood compatibility and donor eligibility. The LLM must NEVER determine compatibility, medical eligibility, blood safety, or make medical decisions. Synthetic demo data only (no real PII).

---

## 2. Team Module Ownership Breakdown
- **Member 1 (Current Agent Owner): Patient / Hospital Module**
  - Patient UI & Hospital UI
  - Patient & Hospital Dashboards
  - Blood Request Creation & Validation
  - My Requests Listing, Search & Filters
  - Request Details & Match Breakdown
  - Request Status Tracking (Full 10-state lifecycle)
  - Login & Authentication context
  - Integration with shared backend API contracts
- **Member 2: Blood Bank Module**
  - Inventory management & buffer thresholds
- **Member 3: Matching & Core Backend**
  - Deterministic matching engine & dispatch
- **Member 4: Donor & Admin Module**
  - Donor roster, emergency alerts & audit log

---

## 3. Request Status Lifecycle & Allowed States
The system defines 10 standardized request states. The frontend must NEVER invent new status names.

1. `CREATED`: Requisition created by patient/hospital and validated.
2. `SEARCHING`: Deterministic matching engine actively evaluating nearby inventory.
3. `MATCHED`: Compatible units identified in blood bank or eligible donors.
4. `PENDING_CONFIRMATION`: Reserved units awaiting blood bank/donor acknowledgement.
5. `ACCEPTED`: Blood bank / donor has confirmed the allocation.
6. `RESERVED`: Units locked in cold storage awaiting pickup or dispatch.
7. `FULFILLED`: Blood delivered, cross-matched, and transfused to the patient.
8. `REJECTED`: Request rejected due to safety or capacity constraints.
9. `CANCELLED`: Requisition cancelled by patient or medical staff.
10. `EXPIRED`: Request exceeded safety time window without fulfillment.

---

## 4. API Contracts (REST / JSON)

### 4.1. Create Blood Request
- **Route:** `POST /blood-requests` (and `/api/blood-requests`)
- **Request Body:**
  ```json
  {
    "patientName": "Demo Patient 101",
    "hospitalId": "hosp-01",
    "requesterRole": "PATIENT" | "HOSPITAL",
    "bloodGroup": "O-" | "O+" | "A-" | "A+" | "B-" | "B+" | "AB-" | "AB+",
    "component": "PRBC" | "WHOLE_BLOOD" | "PLATELETS" | "FFP" | "CRYOPRECIPITATE",
    "unitsRequired": 2,
    "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "ROUTINE",
    "requiredDateTime": "2026-09-28T12:00:00.000Z",
    "location": {
      "hospitalName": "Demo Hospital 01",
      "address": "1001 Potrero Ave, San Francisco",
      "lat": 37.7558,
      "lng": -122.4045
    },
    "contactInformation": {
      "contactPerson": "Dr. Sarah Adams",
      "phoneNumber": "+1 (555) 012-7001",
      "email": "sarah.adams@demohospital01.org",
      "relationship": "Attending Physician"
    },
    "additionalNotes": "Trauma admission, immediate crossmatch requested"
  }
  ```
- **Response (201 Created):**
  Full `BloodRequest` object with `id`, `requestNumber`, `status: "CREATED"`, timestamp.

### 4.2. List Blood Requests
- **Route:** `GET /blood-requests` (and `/api/blood-requests`)
- **Query Params:** `status`, `urgency`, `bloodGroup`, `requesterRole`
- **Response (200 OK):**
  ```json
  {
    "requests": [ ...BloodRequest ],
    "total": 12
  }
  ```

### 4.3. Get Blood Request By ID
- **Route:** `GET /blood-requests/:id` (and `/api/blood-requests/:id`)
- **Response (200 OK):**
  `BloodRequest` object.

### 4.4. Update Request Status
- **Route:** `PATCH /blood-requests/:id/status` (and `/api/blood-requests/:id/status`)
- **Request Body:**
  ```json
  {
    "status": "ACCEPTED" | "RESERVED" | "FULFILLED" | "CANCELLED" | "REJECTED",
    "notes": "Optional status transition note"
  }
  ```

### 4.5. Get Request Matches
- **Route:** `GET /blood-requests/:id/matches` (and `/api/blood-requests/:id/matches`)
- **Response (200 OK):**
  ```json
  {
    "requestId": "req-101",
    "status": "MATCHED",
    "unitsRequired": 2,
    "unitsAllocated": 2,
    "matches": [
      {
        "sourceId": "bb-01",
        "sourceName": "Demo Blood Bank 01 - Metro Central",
        "sourceType": "BLOOD_BANK",
        "bloodGroupOffered": "O-",
        "unitsAllocated": 2,
        "distanceKm": 2.8,
        "status": "CONFIRMED"
      }
    ]
  }
  ```

---

## 5. Technology Standards
- Frontend: React 19, TypeScript, Tailwind CSS, Vite
- Design: Clean healthcare UI, zero unnecessary pills, clear typography, responsive (mobile/tablet/desktop)
- Authentication: Session-based simulation with role switching (`PATIENT`, `HOSPITAL`)

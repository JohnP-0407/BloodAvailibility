import React, { useState } from 'react';
import { BloodBridgeProvider, useBloodBridge } from './context/BloodBridgeContext';
import { Header } from './components/Header';
import { LoginView } from './components/auth/LoginView';
import { PatientDashboardView } from './components/patient/PatientDashboardView';
import { HospitalDashboardView } from './components/hospital/HospitalDashboardView';
import { CreateBloodRequestView } from './components/requests/CreateBloodRequestView';
import { MyRequestsView } from './components/requests/MyRequestsView';
import { RequestDetailsView } from './components/requests/RequestDetailsView';
import { RequestTrackingView } from './components/requests/RequestTrackingView';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { FullMapView } from './components/map/FullMapView';
import { CompatibilityView } from './components/compatibility/CompatibilityView';
import { AiRequestAssistantModal } from './components/ai/AiRequestAssistantModal';

// Blood Bank Module Components (Member 2 Ownership)
import { BloodBankLoginView } from './components/bloodbank/BloodBankLoginView';
import { BloodBankDashboardView } from './components/bloodbank/BloodBankDashboardView';
import { BloodBankInventoryView } from './components/bloodbank/BloodBankInventoryView';
import { BloodBankIncomingRequestsView } from './components/bloodbank/BloodBankIncomingRequestsView';
import { BloodBankRequestDetailsView } from './components/bloodbank/BloodBankRequestDetailsView';
import { BloodBankStockUpdateView } from './components/bloodbank/BloodBankStockUpdateView';
import { BloodBankAnalyticsView } from './components/bloodbank/BloodBankAnalyticsView';

// Donor Module Components (Member 4 Ownership)
import { DonorDashboardView } from './components/donor/DonorDashboardView';
import { DonorProfileView } from './components/donor/DonorProfileView';
import { DonorAvailabilityView } from './components/donor/DonorAvailabilityView';
import { DonorEmergencyRequestsView } from './components/donor/DonorEmergencyRequestsView';
import { DonorDonationHistoryView } from './components/donor/DonorDonationHistoryView';
import { DonorNotificationsView } from './components/donor/DonorNotificationsView';
import { DonorView } from './components/donor/DonorView';

// Admin Module Components (Member 4 Ownership)
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminUsersView } from './components/admin/AdminUsersView';
import { AdminBloodBanksView } from './components/admin/AdminBloodBanksView';
import { AdminVerificationView } from './components/admin/AdminVerificationView';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminAuditView } from './components/admin/AdminAuditView';
import { AdminView } from './components/admin/AdminView';

import { BloodGroup, BloodComponent, UrgencyLevel } from './types/bloodbridge';

// Website Pages (Transformed full website experience)
import { WebsiteHomeView } from './components/website/WebsiteHomeView';
import { FindBloodView } from './components/website/FindBloodView';
import { DonateBloodWebsiteView } from './components/website/DonateBloodWebsiteView';
import { HospitalsPage } from './components/website/HospitalsPage';
import { BloodBanksPage } from './components/website/BloodBanksPage';
import { AboutSafetyPage } from './components/website/AboutSafetyPage';
import { WebsiteFooter } from './components/website/WebsiteFooter';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedRequestId,
    setSelectedRequestId,
    createBloodRequest,
    userRole,
    setUserRole,
    hospitals
  } = useBloodBridge();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [stockUpdatePreset, setStockUpdatePreset] = useState<{
    group?: BloodGroup;
    comp?: BloodComponent;
  }>({});
  const [requisitionPreset, setRequisitionPreset] = useState<{
    group?: BloodGroup;
    comp?: BloodComponent;
  }>({});

  const handleApplyExtractedRequest = async (extracted: {
    patientName: string;
    hospitalId: string;
    bloodGroup: BloodGroup;
    component: BloodComponent;
    unitsNeeded: number;
    urgency: UrgencyLevel;
    clinicalReason: string;
  }) => {
    const hosp = hospitals.find(h => h.id === extracted.hospitalId) || hospitals[0];
    try {
      const newReq = await createBloodRequest({
        patientName: extracted.patientName,
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        requesterRole: userRole === 'HOSPITAL' ? 'HOSPITAL' : 'PATIENT',
        bloodGroup: extracted.bloodGroup,
        component: extracted.component,
        unitsRequired: extracted.unitsNeeded,
        urgency: extracted.urgency,
        requiredDateTime: new Date(Date.now() + 4 * 3600000).toISOString(),
        location: {
          hospitalName: hosp.name,
          address: hosp.address,
          lat: hosp.location.lat,
          lng: hosp.location.lng
        },
        contactInformation: {
          contactPerson: 'Lead Medical Officer',
          phoneNumber: hosp.contactNumber,
          relationship: 'Emergency Clinical Team'
        },
        clinicalReason: extracted.clinicalReason,
        additionalNotes: 'Extracted from unstructured emergency dispatch text via language assistant'
      });
      setSelectedRequestId(newReq.id);
      setActiveTab('request-details');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Public Website Views */}
        {(activeTab === 'home' || !activeTab) && (
          <WebsiteHomeView
            onOpenRequisition={(preset) => {
              if (preset) setRequisitionPreset(preset);
              setActiveTab('create-request');
            }}
            onOpenFindBlood={() => setActiveTab('find-blood')}
            onOpenDonate={() => setActiveTab('donate-blood')}
            onOpenCompatibility={() => setActiveTab('compatibility')}
            onOpenHospitalPortal={() => {
              setUserRole('HOSPITAL');
              setActiveTab('hospital-dashboard');
            }}
            onOpenBloodBankPortal={() => {
              setUserRole('BLOOD_BANK_STAFF');
              setActiveTab('bloodbank-dashboard');
            }}
            onOpenAiAssistant={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'find-blood' && (
          <FindBloodView
            onOpenRequisition={(preset) => {
              if (preset) setRequisitionPreset(preset);
              setActiveTab('create-request');
            }}
          />
        )}

        {activeTab === 'donate-blood' && (
          <DonateBloodWebsiteView
            onDonorRegisteredSuccess={() => {
              setUserRole('DONOR');
              setActiveTab('donor-dashboard');
            }}
            onNavigateToDonorPortal={() => {
              setUserRole('DONOR');
              setActiveTab('donor-dashboard');
            }}
          />
        )}

        {activeTab === 'hospitals-info' && (
          <HospitalsPage
            onOpenRequisition={() => setActiveTab('create-request')}
            onOpenHospitalPortal={() => {
              setUserRole('HOSPITAL');
              setActiveTab('hospital-dashboard');
            }}
            onOpenAiAssistant={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'bloodbanks-info' && (
          <BloodBanksPage
            onOpenBloodBankLogin={() => {
              setUserRole('BLOOD_BANK_STAFF');
              setActiveTab('bloodbank-login');
            }}
            onOpenInventorySearch={() => setActiveTab('find-blood')}
          />
        )}

        {activeTab === 'about-safety' && (
          <AboutSafetyPage
            onOpenCompatibility={() => setActiveTab('compatibility')}
            onOpenDonate={() => setActiveTab('donate-blood')}
          />
        )}

        {/* 1. Login Pages */}
        {activeTab === 'login' && <LoginView />}
        {activeTab === 'bloodbank-login' && (
          <BloodBankLoginView onSuccess={() => setActiveTab('bloodbank-dashboard')} />
        )}

        {/* 2. Dashboards (Role-based & Dedicated) */}
        {(activeTab === 'bloodbank-dashboard' || (activeTab === 'dashboard' && userRole === 'BLOOD_BANK_STAFF')) && (
          <BloodBankDashboardView
            onOpenInventory={() => setActiveTab('inventory')}
            onOpenStockUpdate={(group, comp) => {
              setStockUpdatePreset({ group, comp });
              setActiveTab('stock-update');
            }}
            onOpenIncomingRequests={() => setActiveTab('incoming-requests')}
            onOpenRequestDetails={(id) => {
              setSelectedRequestId(id);
              setActiveTab('bloodbank-request-details');
            }}
            onOpenAnalytics={() => setActiveTab('bloodbank-analytics')}
          />
        )}

        {(activeTab === 'patient-dashboard' || (activeTab === 'dashboard' && userRole === 'PATIENT')) && (
          <PatientDashboardView
            onOpenCreateRequest={() => setActiveTab('create-request')}
            onOpenMyRequests={() => setActiveTab('my-requests')}
            onOpenRequestDetails={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
            onOpenRequestTracking={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-tracking');
            }}
          />
        )}

        {(activeTab === 'hospital-dashboard' || (activeTab === 'dashboard' && userRole === 'HOSPITAL')) && (
          <HospitalDashboardView
            onOpenCreateRequest={() => setActiveTab('create-request')}
            onOpenMyRequests={() => setActiveTab('my-requests')}
            onOpenRequestDetails={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
            onOpenRequestTracking={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-tracking');
            }}
          />
        )}

        {/* 3. Blood Bank Specific Pages (Member 2 Ownership) */}
        {activeTab === 'inventory' && (
          <BloodBankInventoryView
            onOpenStockUpdate={(group, comp) => {
              setStockUpdatePreset({ group, comp });
              setActiveTab('stock-update');
            }}
            onOpenIncomingRequests={() => setActiveTab('incoming-requests')}
          />
        )}

        {activeTab === 'incoming-requests' && (
          <BloodBankIncomingRequestsView
            onSelectRequest={(id) => {
              setSelectedRequestId(id);
              setActiveTab('bloodbank-request-details');
            }}
            onOpenDashboard={() => setActiveTab('bloodbank-dashboard')}
          />
        )}

        {activeTab === 'bloodbank-request-details' && (
          <BloodBankRequestDetailsView
            requestId={selectedRequestId}
            onBack={() => setActiveTab('incoming-requests')}
            onOpenIncomingRequests={() => setActiveTab('incoming-requests')}
          />
        )}

        {activeTab === 'stock-update' && (
          <BloodBankStockUpdateView
            initialGroup={stockUpdatePreset.group}
            initialComp={stockUpdatePreset.comp}
            onSuccess={() => {
              setStockUpdatePreset({});
              setActiveTab('inventory');
            }}
            onCancel={() => {
              setStockUpdatePreset({});
              setActiveTab(userRole === 'BLOOD_BANK_STAFF' ? 'bloodbank-dashboard' : 'inventory');
            }}
          />
        )}

        {activeTab === 'bloodbank-analytics' && (
          <BloodBankAnalyticsView
            onBackToDashboard={() => setActiveTab('bloodbank-dashboard')}
            onOpenInventory={() => setActiveTab('inventory')}
            onOpenStockUpdate={() => setActiveTab('stock-update')}
          />
        )}

        {/* 4. Patient & Hospital Shared Views */}
        {activeTab === 'create-request' && (
          <CreateBloodRequestView
            initialBloodGroup={requisitionPreset.group}
            initialComponent={requisitionPreset.comp}
            onSuccess={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
            onCancel={() => {
              setActiveTab(userRole === 'HOSPITAL' ? 'hospital-dashboard' : 'home');
            }}
            onOpenAiAssistant={() => setIsAiModalOpen(true)}
          />
        )}

        {(activeTab === 'my-requests' || activeTab === 'requests') && (
          <MyRequestsView
            onOpenCreateRequest={() => setActiveTab('create-request')}
            onOpenRequestDetails={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
            onOpenRequestTracking={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-tracking');
            }}
          />
        )}

        {activeTab === 'request-details' && (
          <RequestDetailsView
            requestId={selectedRequestId}
            onBack={() => setActiveTab('my-requests')}
            onOpenTracking={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-tracking');
            }}
          />
        )}

        {activeTab === 'request-tracking' && (
          <RequestTrackingView
            requestId={selectedRequestId}
            onBack={() => setActiveTab('my-requests')}
            onOpenDetails={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
          />
        )}

        {/* 5. Donor Module Views (Member 4 Ownership) */}
        {(activeTab === 'donor-dashboard' || (activeTab === 'dashboard' && userRole === 'DONOR')) && (
          <DonorDashboardView
            onOpenProfile={() => setActiveTab('donor-profile')}
            onOpenAvailability={() => setActiveTab('donor-availability')}
            onOpenEmergencyRequests={() => setActiveTab('donor-emergency-requests')}
            onOpenDonationHistory={() => setActiveTab('donor-history')}
            onOpenNotifications={() => setActiveTab('donor-notifications')}
          />
        )}

        {activeTab === 'donor-profile' && (
          <DonorProfileView
            onBackToDashboard={() => setActiveTab('donor-dashboard')}
            onOpenAvailability={() => setActiveTab('donor-availability')}
          />
        )}

        {activeTab === 'donor-availability' && (
          <DonorAvailabilityView
            onBackToDashboard={() => setActiveTab('donor-dashboard')}
            onOpenEmergencyRequests={() => setActiveTab('donor-emergency-requests')}
          />
        )}

        {activeTab === 'donor-emergency-requests' && (
          <DonorEmergencyRequestsView
            onBackToDashboard={() => setActiveTab('donor-dashboard')}
            onSelectRequestDetails={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
          />
        )}

        {activeTab === 'donor-history' && (
          <DonorDonationHistoryView
            onBackToDashboard={() => setActiveTab('donor-dashboard')}
          />
        )}

        {activeTab === 'donor-notifications' && (
          <DonorNotificationsView
            onBackToDashboard={() => setActiveTab('donor-dashboard')}
            onOpenEmergencyRequests={() => setActiveTab('donor-emergency-requests')}
            onSelectRequestDetails={(id) => {
              setSelectedRequestId(id);
              setActiveTab('request-details');
            }}
          />
        )}

        {(activeTab === 'donor-simulate' || activeTab === 'donor') && (
          <DonorView />
        )}

        {/* 6. Admin Module Views (Member 4 Ownership) */}
        {(activeTab === 'admin-dashboard' || (activeTab === 'dashboard' && userRole === 'ADMIN')) && (
          <AdminDashboardView
            onOpenUsers={() => setActiveTab('admin-users')}
            onOpenBloodBanks={() => setActiveTab('admin-bloodbanks')}
            onOpenVerification={() => setActiveTab('admin-verification')}
            onOpenAnalytics={() => setActiveTab('admin-analytics')}
            onOpenAuditLogs={() => setActiveTab('admin-audit')}
          />
        )}

        {activeTab === 'admin-users' && (
          <AdminUsersView
            onBackToDashboard={() => setActiveTab('admin-dashboard')}
          />
        )}

        {activeTab === 'admin-bloodbanks' && (
          <AdminBloodBanksView
            onBackToDashboard={() => setActiveTab('admin-dashboard')}
            onOpenVerification={() => setActiveTab('admin-verification')}
          />
        )}

        {activeTab === 'admin-verification' && (
          <AdminVerificationView
            onBackToDashboard={() => setActiveTab('admin-dashboard')}
          />
        )}

        {activeTab === 'admin-analytics' && (
          <AdminAnalyticsView
            onBackToDashboard={() => setActiveTab('admin-dashboard')}
          />
        )}

        {activeTab === 'admin-audit' && (
          <AdminAuditView
            onBackToDashboard={() => setActiveTab('admin-dashboard')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView />
        )}

        {/* 7. Geospatial Map & Clinical References */}
        {activeTab === 'map' && <FullMapView />}
        {activeTab === 'compatibility' && <CompatibilityView />}
      </main>

      {/* Rich Multi-Column Website Footer */}
      <WebsiteFooter onNavigate={(tab) => setActiveTab(tab)} />

      {/* Notifications Drawer Component */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectRequest={(id) => {
          setSelectedRequestId(id);
          setActiveTab(userRole === 'BLOOD_BANK_STAFF' ? 'bloodbank-request-details' : 'request-details');
        }}
      />

      {/* AI Assistant Modal (Clerical language extraction only) */}
      <AiRequestAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplyExtractedRequest={handleApplyExtractedRequest}
      />
    </div>
  );
};

export default function App() {
  return (
    <BloodBridgeProvider>
      <MainContent />
    </BloodBridgeProvider>
  );
}

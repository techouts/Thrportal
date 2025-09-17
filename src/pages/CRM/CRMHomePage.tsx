import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CRMDashboardPage from './CRMDashboardPage';
import { CRMOpportunitiesPage } from './CRMOpportunitiesPage';
import { CRMInteractionsPage } from './CRMInteractionsPage';
import CRMReportsPage from './CRMReportsPage';
import CRMIntegrationsPage from './CRMIntegrationsPage';
import CRMDemoOverviewPage from './CRMDemoOverviewPage';
import ClientDetailPage from './ClientDetailPage';

export default function CRMHomePage() {
  return (
    <Routes>
      <Route path="Home" element={<CRMDashboardPage />} />
      <Route path="Client/:clientId" element={<ClientDetailPage />} />
      
      {/* Legacy redirects to Client Desk */}
      <Route path="Clients" element={<Navigate to="/CRM/ClientDesk" replace />} />
      <Route path="Accounts" element={<Navigate to="/CRM/ClientDesk" replace />} />
      <Route path="Projects" element={<Navigate to="/CRM/ClientDesk" replace />} />
      
      <Route path="Opportunities" element={<CRMOpportunitiesPage />} />
      <Route path="Interactions" element={<CRMInteractionsPage />} />
      <Route path="Reports" element={<CRMReportsPage />} />
      <Route path="Integrations" element={<CRMIntegrationsPage />} />
      <Route path="Demo" element={<CRMDemoOverviewPage />} />
      <Route index element={<CRMDashboardPage />} />
    </Routes>
  );
}
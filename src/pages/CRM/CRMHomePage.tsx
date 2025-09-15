import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CRMDashboardPage from './CRMDashboardPage';
import CRMClientsPage from './CRMClientsPage';
import { CRMAccountsPage } from './CRMAccountsPage';
import { CRMProjectsPage } from './CRMProjectsPage';
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
      <Route path="Clients" element={<CRMClientsPage />} />
      <Route path="Client/:clientId" element={<ClientDetailPage />} />
      <Route path="Accounts" element={<CRMAccountsPage />} />
      <Route path="Projects" element={<CRMProjectsPage />} />
      <Route path="Opportunities" element={<CRMOpportunitiesPage />} />
      <Route path="Interactions" element={<CRMInteractionsPage />} />
      <Route path="Reports" element={<CRMReportsPage />} />
      <Route path="Integrations" element={<CRMIntegrationsPage />} />
      <Route path="Demo" element={<CRMDemoOverviewPage />} />
      <Route index element={<CRMDashboardPage />} />
    </Routes>
  );
}
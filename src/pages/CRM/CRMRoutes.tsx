import { Routes, Route } from 'react-router-dom';
import CRMHomePage from './CRMHomePage';
import CRMClientsPage from './CRMClientsPage';
import CRMAccountsPage from './CRMAccountsPage';
import CRMProjectsPage from './CRMProjectsPage';
import CRMOpportunitiesPage from './CRMOpportunitiesPage';
import CRMInteractionsPage from './CRMInteractionsPage';
import CRMReportsPage from './CRMReportsPage';
import ClientDetailPage from './ClientDetailPage';

export default function CRMRoutes() {
  return (
    <Routes>
      <Route path="/Home" element={<CRMHomePage />} />
      <Route path="/Clients" element={<CRMClientsPage />} />
      <Route path="/Client/:clientId" element={<ClientDetailPage />} />
      <Route path="/Accounts" element={<CRMAccountsPage />} />
      <Route path="/Projects" element={<CRMProjectsPage />} />
      <Route path="/Opportunities" element={<CRMOpportunitiesPage />} />
      <Route path="/Interactions" element={<CRMInteractionsPage />} />
      <Route path="/Reports" element={<CRMReportsPage />} />
      <Route path="/*" element={<CRMHomePage />} />
    </Routes>
  );
}
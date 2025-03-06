import { Toaster } from "@/components/ui/toaster";
import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

// Admin pages
import Dashboard from "@/pages/admin/Dashboard";
import Creators from "@/pages/admin/Creators";
import Services from "@/pages/admin/Services";
import Catalogs from "@/pages/admin/Catalogs";
import CreatorDetail from "@/pages/admin/CreatorDetail";
import CreatorRates from "@/pages/admin/CreatorRates";
import CreatorServices from "@/pages/admin/CreatorServices";
import ServicePayments from "@/pages/admin/ServicePayments";
import PostTypes from "@/pages/admin/PostTypes";
import AuditLogs from "@/pages/admin/AuditLogs";
import Utilities from "@/pages/admin/Utilities";
import DbMigrations from "@/pages/admin/DbMigrations"; // Add this import

// Creator pages
import CreatorDashboard from "@/pages/creator/Dashboard";
import CreatorProfile from "@/pages/creator/Profile";
import CreatorServices from "@/pages/creator/Services";
import CreatorBankDetail from "@/pages/creator/BankDetail";
import CreatorCampaigns from "@/pages/creator/Campaigns";
import PendingServices from "@/pages/creator/PendingServices";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin" />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="creators" element={<Creators />} />
          <Route path="creators/:id" element={<CreatorDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="catalogs" element={<Catalogs />} />
          <Route path="creator-rates" element={<CreatorRates />} />
          <Route path="creator-services" element={<CreatorServices />} />
          <Route path="service-payments" element={<ServicePayments />} />
          <Route path="post-types" element={<PostTypes />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="utilities" element={<Utilities />} />
          {/* Add the Database Migrations route */}
          <Route path="db-migrations" element={<DbMigrations />} />
        </Route>

        {/* Creator Routes */}
        <Route path="/creator" element={<ProtectedRoute allowedRole="creator" />}>
          <Route path="dashboard" element={<CreatorDashboard />} />
          <Route path="profile" element={<CreatorProfile />} />
          <Route path="services" element={<CreatorServices />} />
          <Route path="bank-detail" element={<CreatorBankDetail />} />
          <Route path="campaigns" element={<CreatorCampaigns />} />
          <Route path="pending-services" element={<PendingServices />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

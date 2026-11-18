import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboards
import AdminDashboard from "./pages/admin/AdminDashboard";
import SupplierDashboard from "./pages/supplier/SupplierDashboard";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";

// Admin Features
import ManageSuppliers from "./pages/admin/ManageSuppliers";
import ManageProposals from "./pages/admin/ManageProposals";
import AllOrders from "./pages/admin/AllOrders";
import PharmacyOrders from "./pages/admin/PharmacyOrders";
import TenderManagement from "./pages/admin/TenderManagement";

import WarehouseStock from "./pages/admin/WarehouseStock";
import WarehouseStockHistory from "./pages/admin/WarehouseStockHistory";

import PlantStock from "./pages/admin/PlantStock";
import PlantStockHistory from "./pages/admin/PlantStockHistory";

// Supplier Features
import SupplierProposals from "./pages/supplier/MyProposals";
import SubmitProposal from "./pages/supplier/SubmitProposal";

// Layouts and Auth
import PrivateRoute from "./components/PrivateRoute";
import AdminSidebarLayout from "./layouts/AdminSidebarLayout";
import SupplierSidebarLayout from "./layouts/SupplierSidebarLayout";

import RequestStock from "./pages/pharmacy/RequestStock";
import MyRequests from "./pages/pharmacy/MyRequests";
import PharmacySidebarLayout from "./layouts/PharmacySidebarLayout";
import AddTender from "./pages/supplier/AddTenders";

import DrugsManagement from "./pages/pharmacy/DrugsManagement";


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminSidebarLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="suppliers" element={<ManageSuppliers />} />
          <Route path="proposals" element={<ManageProposals />} />
          <Route path="orders" element={<AllOrders />} />
          <Route path="pharmacy-orders" element={<PharmacyOrders />} />
          <Route path="tenders" element={<TenderManagement />} />

          <Route path="warehouse-stock" element={<WarehouseStock />} />
          <Route
            path="warehouse-stock-history"
            element={<WarehouseStockHistory />}
          />
          <Route path="plant-stock-history" element={<PlantStockHistory />} />

          <Route path="plant-stock" element={<PlantStock />} />
          <Route path="plant-stock/history" element={<PlantStockHistory />} />
        </Route>
        {/* Supplier Routes */}
        <Route
          path="/supplier"
          element={
            <PrivateRoute allowedRoles={["supplier"]}>
              <SupplierSidebarLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<SupplierDashboard />} />
          <Route path="proposals" element={<SupplierProposals />} />
          <Route path="submit" element={<SubmitProposal />} />
          <Route path="add-tender" element={<AddTender />} />
        </Route>

        {/* Pharmacy Routes */}
        <Route
          path="/pharmacy"
          element={
            <PrivateRoute allowedRoles={["pharmacy"]}>
              <PharmacySidebarLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<PharmacyDashboard />} />
          <Route path="request" element={<RequestStock />} />
          <Route path="my-requests" element={<MyRequests />} />
          <Route path="drugs" element={<DrugsManagement />} />{" "}
          {/* ✅ Add this */}
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;

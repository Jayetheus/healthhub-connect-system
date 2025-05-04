
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { UserProvider } from "@/contexts/UserContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/doctor/Patients";
import Appointments from "./pages/patient/Appointments";
import PatientMedicalRecords from "./pages/patient/MedicalRecords";
import DoctorMedicalRecords from "./pages/doctor/MedicalRecords";
import Prescriptions from "./pages/patient/Prescriptions";
import DeleteUserPage from "./pages/admin/DeleteUser";
import { useEffect } from "react";
import AddUserPage from "./pages/admin/AddUser";
import EditUserPage from "./pages/admin/EditUser";
import AddRecordPage from "@/pages/doctor/AddRecord"

const queryClient = new QueryClient();

// Protected route component that checks user role
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role } = useRole();
  
  useEffect(() => {
    // Check if the role is set in localStorage and update context if necessary
    const storedRole = localStorage.getItem("user_role");
    if (storedRole && storedRole !== role) {
      localStorage.setItem("user_role", storedRole);
    } 

    if (!role){
      localStorage.clear();
    }
  }, [role])

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-specific layout that only shows content for the appropriate role
const RoleBasedLayout = ({ allowedRoles }) => {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Layout />
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route element={<RoleBasedLayout allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/delete-user" element={<DeleteUserPage />} />
              <Route path="/admin/add-user" element={<AddUserPage />} />
              <Route path="/admin/edit-user" element={<EditUserPage />} />
            </Route>
            
            {/* Doctor Routes */}
            <Route element={<RoleBasedLayout allowedRoles={["doctor"]} />}>
              <Route path="/doctor/dashboard" element={<Dashboard />} />
              <Route path="/doctor/patients" element={<Patients />} />
              <Route path="/doctor/appointments" element={<Appointments />} />
              <Route path="/doctor/medical-records" element={<DoctorMedicalRecords />} />
              <Route path="/doctor/add-record" element={<AddRecordPage />} />
            </Route>
            
            {/* Pharmacist Routes */}
            <Route element={<RoleBasedLayout allowedRoles={["pharmacist"]} />}>
              <Route path="/pharmacist/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Patient Routes */}
            <Route element={<RoleBasedLayout allowedRoles={["patient"]} />}>
              <Route path="/patient/dashboard" element={<Dashboard />} />
              <Route path="/patient/appointments" element={<Appointments />} />
              <Route path="/patient/medical-records" element={<PatientMedicalRecords />} />
              <Route path="/patient/prescriptions" element={<Prescriptions />} />
            </Route>
            
            {/* Redirect from common routes to role-specific routes */}
            <Route 
              path="/dashboard" 
              element={<Navigate to="/login" replace />} 
            />
            
            {/* Catch-all redirect to not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </UserProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { addUserAccount } from "@/api/patientApi";

export default function AddUserPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for each role
  const [adminForm, setAdminForm] = useState({
    username: "",
    password: "",
    fullname: "",
    email: "",
    phone: ""
  });

  const [pharmacistForm, setPharmacistForm] = useState({
    username: "",
    password: "",
    name: "",
    license_number: "",
    phone: "",
    email: ""
  });

  const [patientForm, setPatientForm] = useState({
    fname: "",
    lname: "",
    id_number: "",
    sex: "",
    date_of_birth: "",
    address: "",
    phone: "",
    email: "",
    blood_type: "",
    password: "",
    profile_picture: null as File | null
  });

  const [doctorForm, setDoctorForm] = useState({
    username: "",
    password: "",
    name: "",
    speciality: "",
    license_number: "",
    email: "",
    phone: ""
  });

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handlePharmacistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPharmacistForm({ ...pharmacistForm, [e.target.name]: e.target.value });
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  const handlePatientFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPatientForm({ ...patientForm, profile_picture: e.target.files[0] });
    }
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDoctorForm({ ...doctorForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let formData;
      switch (selectedRole) {
        case "admin":
          formData = { ...adminForm, role: "admin" };
          break;
        case "pharmacist":
          formData = { ...pharmacistForm, role: "pharmacist" };
          break;
        case "patient":
          formData = { ...patientForm, role: "patient" };
          break;
        case "doctor":
          formData = { ...doctorForm, role: "doctor" };
          break;
        default:
          throw new Error("Please select a role");
      }

      await addUserAccount(formData);
      toast({
        title: "Success",
        description: `${selectedRole} account created successfully`,
      });
      navigate("/admin/users");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => navigate("/admin/users")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              <span>Add New User</span>
            </CardTitle>
            <CardDescription>
              Select the role and fill in the required information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role">User Role</Label>
                  <Select onValueChange={handleRoleChange} value={selectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist</SelectItem>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Form */}
                {selectedRole === "admin" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={adminForm.username}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={adminForm.password}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        name="fullname"
                        value={adminForm.fullname}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={adminForm.email}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={adminForm.phone}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Pharmacist Form */}
                {selectedRole === "pharmacist" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={pharmacistForm.username}
                        onChange={handlePharmacistChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={pharmacistForm.password}
                        onChange={handlePharmacistChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={pharmacistForm.name}
                        onChange={handlePharmacistChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        name="license_number"
                        value={pharmacistForm.license_number}
                        onChange={handlePharmacistChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={pharmacistForm.email}
                        onChange={handlePharmacistChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={pharmacistForm.phone}
                        onChange={handlePharmacistChange}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Patient Form */}
                {selectedRole === "patient" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fname">First Name</Label>
                      <Input
                        id="fname"
                        name="fname"
                        value={patientForm.fname}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lname">Last Name</Label>
                      <Input
                        id="lname"
                        name="lname"
                        value={patientForm.lname}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="id_number">ID Number</Label>
                      <Input
                        id="id_number"
                        name="id_number"
                        value={patientForm.id_number}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex</Label>
                      <Select
                        onValueChange={(value) => setPatientForm({ ...patientForm, sex: value })}
                        value={patientForm.sex}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={patientForm.date_of_birth}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={patientForm.address}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={patientForm.phone}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={patientForm.email}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type</Label>
                      <Select
                        onValueChange={(value) => setPatientForm({ ...patientForm, blood_type: value })}
                        value={patientForm.blood_type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={patientForm.password}
                        onChange={handlePatientChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile_picture">Profile Picture</Label>
                      <Input
                        id="profile_picture"
                        name="profile_picture"
                        type="file"
                        accept="image/*"
                        onChange={handlePatientFileChange}
                      />
                    </div>
                  </div>
                )}

                {/* Doctor Form */}
                {selectedRole === "doctor" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={doctorForm.username}
                        onChange={handleDoctorChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={doctorForm.password}
                        onChange={handleDoctorChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={doctorForm.name}
                        onChange={handleDoctorChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="speciality">Speciality</Label>
                      <Input
                        id="speciality"
                        name="speciality"
                        value={doctorForm.speciality}
                        onChange={handleDoctorChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="license_number">License Number</Label>
                      <Input
                        id="license_number"
                        name="license_number"
                        value={doctorForm.license_number}
                        onChange={handleDoctorChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={doctorForm.email}
                        onChange={handleDoctorChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={doctorForm.phone}
                        onChange={handleDoctorChange}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={!selectedRole || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
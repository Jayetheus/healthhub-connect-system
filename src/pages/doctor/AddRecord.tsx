import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  UserRound,
  CalendarDays,
  ClipboardList,
  Pill,
  Clock,
  ChevronDown,
  X,
  Loader2,
  CheckCircle2,
  Search,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { createPatientRecord, getPatients, Patient } from "@/api/patientApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Treatment {
  diagnosis: string;
  treatment_description: string;
  medications: string;
  follow_up_date: string;
  treatment_date: string;
}

interface RecordData {
  patient_id: string;
  type: string;
  description: string;
  details: string;
  date: string;
  doctor: string;
  treatment: Treatment;
}

const AddRecordPage = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { name, surname } = useUser();
  const navigate = useNavigate();

  const [record, setRecord] = useState<RecordData>({
    patient_id: "",
    type: "Examination",
    description: "",
    details: "",
    date: new Date().toISOString().split('T')[0],
    doctor: `${name} ${surname}`,
    treatment: {
      diagnosis: "",
      treatment_description: "",
      medications: "",
      follow_up_date: "",
      treatment_date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        setPatients(data);
        setLoadingPatients(false);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        toast({
          title: "Error",
          description: "Failed to load patient list",
          variant: "destructive",
        });
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [toast]);

  const filteredPatients = patients.filter(patient => 
    patient.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_id.toString().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecord(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecord(prev => ({
      ...prev,
      treatment: {
        ...prev.treatment,
        [name]: value
      }
    }));
  };

  const handleRecordTypeChange = (value: string) => {
    setRecord(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setRecord(prev => ({
      ...prev,
      patient_id: patient.patient_id.toString()
    }));
    setShowDiagnosisModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createPatientRecord(record);
      toast({
        title: "Success",
        description: "Diagnosis record created successfully",
      });
      setSuccess(true);
      setTimeout(() => navigate(-2) , 2000);
    } catch (error) {
      console.error("Failed to create record:", error);
      toast({
        title: "Error",
        description: "Failed to create diagnosis record",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPatients) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading patient data...</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <h2 className="text-2xl font-bold">Diagnosis Record Created Successfully!</h2>
        <p>Redirecting to medical records...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <Stethoscope className="h-8 w-8 mr-2" />
            Create New Medical Record
          </h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Select Patient
            </CardTitle>
            <CardDescription>
              Search for a patient to create a new medical record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients by name or ID..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.patient_id}>
                        <TableCell>{patient.patient_id}</TableCell>
                        <TableCell>{patient.fname} {patient.lname}</TableCell>
                        <TableCell>{patient.date_of_birth}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleSelectPatient(patient)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No patients found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Modal */}
        {showDiagnosisModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">
                  Create New Record for {selectedPatient.fname} {selectedPatient.lname}
                </h2>
                <button 
                  onClick={() => setShowDiagnosisModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Record Type</Label>
                      <Select 
                        value={record.type} 
                        onValueChange={handleRecordTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Examination">Examination</SelectItem>
                          <SelectItem value="Note">Note</SelectItem>
                          <SelectItem value="Procedure">Procedure</SelectItem>
                          <SelectItem value="Lab Result">Lab Result</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={record.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of the visit"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="details">Clinical Notes</Label>
                      <Textarea
                        id="details"
                        name="details"
                        value={record.details}
                        onChange={handleInputChange}
                        placeholder="Detailed clinical notes..."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        name="diagnosis"
                        value={record.treatment.diagnosis}
                        onChange={handleTreatmentChange}
                        placeholder="Primary diagnosis"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="treatment_description">Treatment Plan</Label>
                      <Textarea
                        id="treatment_description"
                        name="treatment_description"
                        value={record.treatment.treatment_description}
                        onChange={handleTreatmentChange}
                        placeholder="Detailed treatment plan..."
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="medications">Prescribed Medications</Label>
                      <Textarea
                        id="medications"
                        name="medications"
                        value={record.treatment.medications}
                        onChange={handleTreatmentChange}
                        placeholder="List of prescribed medications..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="treatment_date" className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-1" />
                          Treatment Date
                        </Label>
                        <Input
                          type="date"
                          id="treatment_date"
                          name="treatment_date"
                          value={record.treatment.treatment_date}
                          onChange={handleTreatmentChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="follow_up_date" className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Follow-up Date
                        </Label>
                        <Input
                          type="date"
                          id="follow_up_date"
                          name="follow_up_date"
                          value={record.treatment.follow_up_date}
                          onChange={handleTreatmentChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setShowDiagnosisModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Record...
                      </>
                    ) : (
                      "Create Diagnosis Record"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddRecordPage;
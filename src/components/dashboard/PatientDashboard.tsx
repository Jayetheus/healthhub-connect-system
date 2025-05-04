import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Clock, PlusSquare, FileText, Loader2, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAppointments, Appointment, getPatientRecords, Prescription, getPrescriptions, PatientRecord } from "@/api/patientApi";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useRole } from "@/contexts/RoleContext";

export function PatientDashboard() {
  const user = useUser();
  const {role, setRole} = useRole()
  const patientName = `${user.name} ${user.surname}`; 
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [prescriptionsData, setPrescriptionsData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState({
    appointments: true,
    records: true,
    prescriptions: true
  });
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, appointments: true }));
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);
      } catch (error) {

        console.error("Failed to fetch appointments:", error);
        if(error.response?.status === 401) {
          toast({
            title: "Unauthorized",
            description: "Please log in again",
            variant: "destructive",
          });

          localStorage.clear();
          setRole(undefined)
        }

        console.error("Failed to fetch appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load your appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(prev => ({ ...prev, appointments: false }));
      }

      try {
        setLoading(prev => ({ ...prev, records: true }));
        const recordsData = await getPatientRecords("patient");
        setRecords(recordsData);
      } catch (error) {
        console.error("Failed to fetch your records:", error);
        toast({
          title: "Error",
          description: "Failed to load your records",
          variant: "destructive",
        });
      } finally {
        setLoading(prev => ({ ...prev, records: false }));
      }

      try {
        setLoading(prev => ({ ...prev, prescriptions: true }));
        const prescriptionsData = await getPrescriptions();
        const transformedData = prescriptionsData.map((item) => ({
          id: item.id,
          medication: item.medication,
          dosage: item.dosage,
          doctor: item.doctor || "Unknown",
          pharmacist: item.pharmacist || "Unknown",
          prescription_date: item.prescription_date || "N/A",
          status: item.status || "Unknown",
          instruction: item.instruction || "N/A",
          date_filled: item.date_filled || "N/A",
          refills_remaining: item.refills_remaining || 0,
          date_prescribed: item.date_prescribed || "N/A",
          code: item.code || "N/A",
          patient: item.patient || "Unknown", // Add the missing 'patient' property
        }));
        setPrescriptionsData(transformedData);
      } catch (error) {
        console.error("Failed to fetch prescriptions:", error);
        toast({
          title: "Error",
          description: "Failed to load prescriptions",
          variant: "destructive",
        });
      } finally {
        setLoading(prev => ({ ...prev, prescriptions: false }));
      }
    };

    fetchData();
  }, [toast]);

  // Generate appointment data for the chart
  const appointmentChartData = useMemo(() => {
    if (loading.appointments) return [];
    
    const approvedAppointments = appointments.filter(app => app.status === 'Approved');
    const monthCounts: Record<string, number> = {};
    
    // Initialize all months with 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      monthCounts[month] = 0;
    });
    
    // Count appointments by month
    approvedAppointments.forEach(app => {
      const date = new Date(app.start_time);
      const month = format(date, 'MMM');
      monthCounts[month]++;
    });
    
    // Convert to array format for Recharts
    return months.map(month => ({
      month,
      appointments: monthCounts[month]
    }));
  }, [appointments, loading.appointments]);

  // Function to format appointments for display
  const formatAppointmentsForDisplay = () => {
    return appointments.map((appointment, index) => ({
      id: index + 1,
      doctorName: appointment.doctor_name,
      time: new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(appointment.start_time).toLocaleDateString([], { year: 'numeric', month: 'long', day: '2-digit' }),
      type: appointment.type,
      status: appointment.status,
    }));
  };

  const upcomingAppointments = formatAppointmentsForDisplay();
  const isLoading = loading.appointments || loading.records || loading.prescriptions;

  const openRecordDetails = (record: PatientRecord) => {
    setSelectedRecord(record);
  };

  const closeRecordDetails = () => {
    setSelectedRecord(null);
  };

  return (
    <div className="container py-8">
      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Medical Record Details</h2>
              <button 
                onClick={closeRecordDetails}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-500">Record Type</h3>
                  <p>{selectedRecord.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500">Date</h3>
                  <p>{selectedRecord.date}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500">Doctor</h3>
                  <p>{selectedRecord.doctor}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-500">Description</h3>
                  <p>{selectedRecord.description || "No description provided"}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500">Details</h3>
                  <p>{selectedRecord.details || "No additional details"}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-gray-500 mb-2">Treatment Information</h3>
              {selectedRecord.treatment[0].length > 0 ? (
                <div className="space-y-4">
                  {selectedRecord.treatment[0].map((treatment, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Diagnosis</h4>
                          <p>{treatment.diagnosis || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Treatment Date</h4>
                          <p>{treatment.date || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Description</h4>
                          <p>{treatment.description || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Follow-up Date</h4>
                          <p>{treatment.follow_up_date || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No treatment information available</p>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={closeRecordDetails}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {patientName}</h1>
            <p className="text-muted-foreground">Here's a summary of your health information</p>
          </div>
          <div className="flex space-x-2">
            <Button asChild>
              <Link to="/patient/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Appointments
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading.appointments ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{appointments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {appointments.length > 0 
                      ? `Next on ${new Date(appointments[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${new Date(appointments[0].start_time).toLocaleDateString()}` 
                      : "No upcoming appointments"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Medications
              </CardTitle>
              <PlusSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading.prescriptions ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{prescriptionsData.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {prescriptionsData.length > 0 
                      ? prescriptionsData.some(p => p.refills_remaining > 0) 
                        ? "Some medications have refills remaining"
                        : "No refills remaining"
                      : "No active medications"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Medical Records
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading.records ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{records.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {records.length === 1 ? "1 record" : `${records.length} records`}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approved Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Appointments</CardTitle>
            <CardDescription>
              Your approved appointments by month
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {loading.appointments ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={appointmentChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Approved Appointments"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading.appointments ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 rounded-md border p-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center space-x-4 rounded-md border p-3"
                    >
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{appointment.doctorName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>{appointment.time}</span>
                          <span className="mx-1">•</span>
                          <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {appointment.type}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            appointment.status === 'Approved' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0"
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="flex-shrink-0"
                        >
                          <Link to={`/appointments/${appointment.id}`}>Details</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">No upcoming appointments found</p>
              )}
              <div className="flex justify-center mt-4">
                <Button variant="outline" asChild>
                  <Link to="/patient/appointments">Schedule New And View Appointments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              {loading.prescriptions ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-md border p-3">
                      <Skeleton className="h-4 w-[150px] mb-2" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  ))}
                </div>
              ) : prescriptionsData.length > 0 ? (
                <div className="space-y-4">
                  {prescriptionsData.map((medication) => (
                    <div
                      key={medication.id}
                      className="rounded-md border p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{medication.code}</p>
                          <p className="text-sm font-medium">{medication.dosage}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {medication.medication}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Refill by: {medication.date_filled}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            medication.refills_remaining > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {medication.refills_remaining} refills
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4">No current medications</p>
              )}
              <div className="flex justify-center mt-4">
                <Button variant="outline" asChild>
                  <Link to="/patient/prescriptions">View All Medications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Medical Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading.records ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-8 w-[60px]" />
                  </div>
                ))}
              </div>
            ) : records.length > 0 ? (
              <div className="space-y-4">
                {records.slice(0, 3).map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.date} • {record.doctor}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openRecordDetails(record)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">No medical records found</p>
            )}
            <div className="flex justify-center mt-4">
              <Button variant="outline" asChild>
                <Link to="/patient/medical-records">View All Records</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
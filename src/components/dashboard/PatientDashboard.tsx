import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Clock, PlusSquare, FileText, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAppointments, Appointment, getPatientRecords, Prescription, getPrescriptions, PatientRecord } from "@/api/patientApi";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";


// Sample health metrics data
const healthData = [
  { month: "Jan", weight: 162, bloodPressure: 120 },
  { month: "Feb", weight: 158, bloodPressure: 118 },
  { month: "Mar", weight: 120, bloodPressure: 118 },
  { month: "Apr", weight: 168, bloodPressure: 116 },
  { month: "May", weight: 150, bloodPressure: 115 },
  { month: "Jun", weight: 143, bloodPressure: 114 },
];

export function PatientDashboard() {
  const user = useUser()
  const patientName = `${user.name} ${user.surname}`; 
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] =  useState<PatientRecord[]>([])
  const [prescriptionsData, setPrescriptionsData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast({
          title: "Error",
          description: "Failed to load your appointments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await getPatientRecords();
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch your records:", error);
        toast({
          title: "Error",
          description: "Failed to load your records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchPrescriptions = async () => {
          setLoading(true);
          try {
           
    
            const data = await getPrescriptions();
            const transformedData = data.map((item) => ({
              id: item.id,
              medication: item.medication,
              dosage: item.dosage,
              doctor: item.doctor || "Unknown",
              pharmacist: item.pharmacist || "Unknown",
              prescription_date: item.prescription_date|| "N/A",
              status: item.status || "Unknown",
              instruction: item.instruction || "N/A",
              date_filled: item.date_filled || "N/A",
              refills_remaining: item.refills_remaining || 0,
              date_prescribed: item.date_prescribed   || "N/A",
              code: item.code || "N/A",
            }));
    
    
            console.log("Fetched prescriptions:", transformedData);
            setPrescriptionsData(transformedData);
          } catch (error) {
            console.error("Failed to fetch prescriptions:", error);
            toast({
              title: "Error",
              description: "Failed to load prescriptions",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        };
    
    fetchPrescriptions();
    fetchAppointments();
    fetchRecords();
  }, [toast]);

  // Function to format appointments for display
  const formatAppointmentsForDisplay = () => {
    return appointments.map((appointment, index) => ({
      id: index + 1,
      doctorName: appointment.doctor_name,
      time: new Date(appointment.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(appointment.start_time).toLocaleDateString([], { year: 'numeric', month: 'long', day: '2-digit' }),
      type: appointment.type,
    }));
  };

  const upcomingAppointments = formatAppointmentsForDisplay();

  return (
    <div className="container py-8">
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
              <div className="text-2xl font-bold">{ loading ? "Loading..." : appointments.length}</div>
              <p className="text-xs text-muted-foreground">
                
                { loading ? "Loading appointments..." : appointments.length > 0 
                  ? `Next on ${new Date(appointments[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } ${new Date(appointments[0].start_time).toLocaleDateString()}` 
                  : "No upcoming appointments" }
              </p>
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
              <div className="text-2xl font-bold">{prescriptionsData.length}</div>
              <p className="text-xs text-muted-foreground">
                {prescriptionsData.map((prescription)=>(
                  prescription.refills_remaining > 0 ? `${prescription.refills_remaining} refills remaining` : "No refills remaining"
                ))}
              </p>
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
              <div className="text-2xl font-bold">{ loading ? 'Loading...' : records.length}</div>
              <p className="text-xs text-muted-foreground">{ loading ? 'Loading...' : "Total records"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Health Metrics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>
              Your health trends over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={healthData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke="#0ea5e9"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bloodPressure"
                  stroke="#10b981"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-4">Loading your appointments...</p>
                ) : upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
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
                        <p className="text-sm text-muted-foreground">
                          {appointment.type}
                        </p>
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
                  ))
                ) : (
                  <p className="text-center py-4">No upcoming appointments found</p>
                )}
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/patient/appointments">Schedule New And View Appointments</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
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
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center">
                  <Button variant="outline" asChild>
                    <Link to="/patient/prescriptions">View All Medications</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Medical Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {records.map((record, index) => (
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
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/medical-records/${record.id}`}>View</Link>
                  </Button>
                </div>
              ))}
              <div className="flex justify-center">
                <Button variant="outline" asChild>
                  <Link to="/patient/medical-records">View All Records</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

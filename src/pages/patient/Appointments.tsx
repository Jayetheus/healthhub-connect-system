import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  CalendarPlus,
  Clock,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  UserRound,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getAppointments, cancelAppointment, scheduleAppointment, getDoctors, AvailableDoctors } from "@/api/patientApi";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, isBefore, isAfter, parseISO } from "date-fns";

// Time slots configuration
const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", 
  "03:00 PM", "04:00 PM"
];

// Helper function to get next 5 weekdays from today
const getWeekdayOptions = () => {
  const options = [];
  let date = new Date();
  
  // If today is weekend, start from next Monday
  if (date.getDay() === 0) { // Sunday
    date = addDays(date, 1);
  } else if (date.getDay() === 6) { // Saturday
    date = addDays(date, 2);
  }
  
  // Get next 5 weekdays
  while (options.length < 5) {
    if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
      options.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEEE, MMMM do')
      });
    }
    date = addDays(date, 1);
  }
  
  return options;
};

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const { toast } = useToast();
  const appointmentsPerPage = 8;

  // New appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    doctor: '',
    reason: '',
    notes: ''
  });
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState(TIME_SLOTS);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const data = await getAppointments();
        const sortedData = data.sort((a, b) => 
          new Date(b.start_time + ' ' + b.start_time).getTime() - new Date(a.start_time + ' ' + a.start_time).getTime()
        );
        setAppointmentsData(sortedData);
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
    fetchAppointments();
  }, [toast]);

  // Mock function to fetch available doctors - replace with actual API call
  const fetchAvailableDoctors = async (): Promise<AvailableDoctors[]> =>  {
    // In a real app, this would be an API call to get doctors available on the selected date
    return getDoctors();
  };

  // Mock function to check time slot availability - replace with actual API call
  const checkTimeSlotAvailability = async (date: string, time: string) => {
    // In a real app, this would check if the time slot is available
    // For demo purposes, we'll just return true for all slots except 2 random ones
    const unavailableSlots = TIME_SLOTS.sort(() => 0.5 - Math.random()).slice(0, 2);
    return !unavailableSlots.includes(time);
  };

  const handleDateChange = async (date: string) => {
    setAppointmentForm(prev => ({
      ...prev,
      date,
      time: '',
      doctor: ''
    }));
    
    // Fetch available doctors for selected date
    const doctors = await fetchAvailableDoctors();
    setAvailableDoctors(doctors);
    
    // Reset time slots
    setAvailableTimeSlots(TIME_SLOTS);
  };

  const handleTimeChange = async (time: string) => {
    setAppointmentForm(prev => ({ ...prev, time: time }));
  };

  const handleScheduleAppointment = async () => {
    if (!appointmentForm.date || !appointmentForm.time || !appointmentForm.doctor || !appointmentForm.reason) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    
    setScheduling(true);
    try {
      // Check if time slot is still available
      const isAvailable = await checkTimeSlotAvailability(appointmentForm.date, appointmentForm.time);
      if (!isAvailable) {
        toast({
          title: "Error",
          description: "The selected time slot is no longer available. Please choose another time.",
          variant: "destructive",
        });
        return;
      }

      // Schedule appointment
      const newAppointment = {
        date: appointmentForm.date,
        time: appointmentForm.time,
        doctor: appointmentForm.doctor,
        reason: appointmentForm.reason,
        notes: appointmentForm.notes,
        status: "Scheduled"
      };

      await scheduleAppointment(newAppointment);
      
      toast({
        title: "Success",
        description: "Appointment scheduled successfully!",
      });

      // Refresh appointments
      const data = await getAppointments();
      setAppointmentsData(data.sort((a, b) => 
        new Date(b.start_time + ' ' + b.start_time).getTime() - new Date(a.start_time + ' ' + a.start_time).getTime()
      ));

      // Close modal and reset form
      setScheduleModalOpen(false);
      setAppointmentForm({
        date: '',
        time: '',
        doctor: '',
        reason: '',
        notes: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleCancelAppointment = async () => {
    setCancelling(true);
    try {
      await cancelAppointment(selectedAppointment.appointment_id);
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
      const data = await getAppointments();
      setAppointmentsData(data.sort((a, b) => 
        new Date(b.start_time + ' ' + b.start_time).getTime() - new Date(a.start_time + ' ' + a.start_time).getTime()
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
      setCancelModalOpen(false);
    }
  };

  // Filter appointments based on search term, date and status
  const filteredAppointments = appointmentsData.filter((appointment) => {
    const matchesSearch =
      appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase());

    const appointmentDate = new Date(appointment.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const matchesDate =
      selectedDate === "all" ||
      (selectedDate === "today" && appointment.start_date === today.toISOString().split('T')[0]) ||
      (selectedDate === "tomorrow" && appointment.start_date === tomorrow.toISOString().split('T')[0]) ||
      (selectedDate === "yesterday" && appointment.start_date === yesterday.toISOString().split('T')[0]);

    const matchesStatus =
      selectedStatus === "all" || appointment.status === selectedStatus;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Get current appointments
  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(
    indexOfFirstAppointment,
    indexOfLastAppointment
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Status badge styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Checked In":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "No Show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container py-8">
      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Cancel Appointment</h2>
              <button 
                onClick={() => !cancelling && setCancelModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={cancelling}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="mb-6">Are you sure you want to cancel this appointment with {selectedAppointment?.doctor_name} on {selectedAppointment?.start_date} at {selectedAppointment?.start_time}?</p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
              >
                No, Keep It
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Appointment Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Schedule New Appointment</h2>
              <button 
                onClick={() => !scheduling && setScheduleModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={scheduling}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="date">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={appointmentForm.date}
                    onValueChange={handleDateChange}
                    disabled={scheduling}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a date" />
                    </SelectTrigger>
                    <SelectContent>
                      {getWeekdayOptions().map((option, index) => (
                        <SelectItem key={option.index} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="time">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={appointmentForm.time}
                    onValueChange={handleTimeChange}
                    disabled={!appointmentForm.date || scheduling}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={appointmentForm.date ? "Select a time" : "Select date first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimeSlots.map((time, index) => (
                        <SelectItem key={index} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="doctor">
                    Doctor <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={appointmentForm.doctor}
                    onValueChange={(value) => setAppointmentForm(prev => ({ ...prev, doctor: value }))}
                    disabled={!appointmentForm.date || scheduling}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={appointmentForm.date ? "Select a doctor" : "Select date first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.speciality}
                        <span className="text-sm text-gray-500"> ({doctor.email})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="reason">
                    Reason for Visit <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="reason"
                    placeholder="e.g. Annual checkup, specific symptoms"
                    value={appointmentForm.reason}
                    onChange={(e) => setAppointmentForm(prev => ({ ...prev, reason: e.target.value }))}
                    disabled={scheduling}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="notes">
                  Additional Notes
                </label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information you'd like to share with the doctor"
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  disabled={scheduling}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setScheduleModalOpen(false)}
                disabled={scheduling}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleAppointment}
                disabled={scheduling}
              >
                {scheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Appointment"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Appointments</h1>
          <Button 
            onClick={() => setScheduleModalOpen(true)}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarPlus className="mr-2 h-4 w-4" />
            )}
            New Appointment
          </Button>
        </div>

        <div className="container py-8">
      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Cancel Appointment</h2>
              <button 
                onClick={() => !cancelling && setCancelModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={cancelling}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="mb-6">Are you sure you want to cancel this appointment with {selectedAppointment?.doctor_name} on {selectedAppointment?.start_date} at {selectedAppointment?.start_time}?</p>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
              >
                No, Keep It
              </Button>
              <Button 
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

        <Card>
          <CardHeader>
            <CardTitle>Appointment Schedule</CardTitle>
            <CardDescription>
              View and manage all scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading appointments...</span>
              </div>
            ) : (
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                  <div className="flex flex-col space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row items-center justify-between">
                      <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search appointments..."
                          className="pl-8 w-full"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                          value={selectedDate}
                          onValueChange={setSelectedDate}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by date" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={selectedStatus}
                          onValueChange={setSelectedStatus}
                          disabled={loading}
                        >
                          <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Scheduled">Scheduled</SelectItem>
                            <SelectItem value="Checked In">Checked In</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="Cancelled">Cancelled</SelectItem>
                            <SelectItem value="No Show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedDate("all");
                            setSelectedStatus("all");
                          }}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCcw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Doctor</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentAppointments.length > 0 ? (
                            currentAppointments.map((appointment) => (
                              <TableRow key={appointment.appointment_id}>
                                <TableCell>{appointment.doctor_name}</TableCell>
                                <TableCell>{appointment.start_date}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    {appointment.start_time}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                                    {appointment.end_time}
                                  </div>
                                </TableCell>
                                <TableCell>{appointment.type}</TableCell>
                                <TableCell>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(
                                      appointment.status
                                    )}`}
                                  >
                                    {appointment.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {appointment.status === "Scheduled" && (
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setCancelModalOpen(true);
                                      }}
                                      disabled={loading}
                                    >
                                      <span className="sr-only">Cancel appointment</span>
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8">
                                No appointments found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => {
                                if (currentPage > 1) paginate(currentPage - 1);
                              }}
                              className={currentPage === 1 || loading ? "pointer-events-none opacity-50" : ""}
                              
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: Math.ceil(filteredAppointments.length / appointmentsPerPage) },
                            (_, i) => (
                              <PaginationItem key={i + 1}>
                                <PaginationLink
                                  isActive={currentPage === i + 1}
                                  onClick={() => !loading && paginate(i + 1)}
                                  
                                >
                                  {i + 1}
                                </PaginationLink>
                              </PaginationItem>
                            )
                          )}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => {
                                if (
                                  currentPage <
                                  Math.ceil(filteredAppointments.length / appointmentsPerPage)
                                )
                                  paginate(currentPage + 1);
                              }}
                              className={
                                currentPage >=
                                Math.ceil(filteredAppointments.length / appointmentsPerPage) || loading
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                              
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="calendar">
                  <div className="flex justify-center items-center p-8 border rounded-md">
                    <div className="text-center">
                      <CalendarCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Calendar View</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mt-2">
                        The calendar view will be available in the next update. Please use the list view for now.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>

  );
};

export default Appointments;
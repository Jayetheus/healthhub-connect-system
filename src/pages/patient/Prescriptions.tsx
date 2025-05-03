import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Pill,
  FilePlus,
  Search,
  MoreHorizontal,
  UserRound,
  CalendarDays,
  RefreshCcw,
  Clipboard,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/hooks/use-toast";
import { getPrescriptions, Prescription } from "@/api/patientApi";



const Prescriptions = () => {
  const { id } = useParams(); // Get patient ID from URL if needed
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [prescriptionsData, setPrescriptionsData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const prescriptionsPerPage = 8;

  useEffect(() => {
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
  }, [id, toast]);

  // Filter prescriptions based on search term and status
  const filteredPrescriptions = prescriptionsData.filter((prescription) => {
    const matchesSearch =
      prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.instruction.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || prescription.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Get current prescriptions
  const indexOfLastPrescription = currentPage * prescriptionsPerPage;
  const indexOfFirstPrescription = indexOfLastPrescription - prescriptionsPerPage;
  const currentPrescriptions = filteredPrescriptions.slice(
    indexOfFirstPrescription,
    indexOfLastPrescription
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get status styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Discontinued":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const endpoint = id ? `get_prescriptions/${id}` : 'get_prescriptions';
      const data = await getPrescriptions();
      setPrescriptionsData(data);
      setSearchTerm("");
      setSelectedStatus("all");
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to refresh prescriptions:", error);
      toast({
        title: "Error",
        description: "Failed to refresh prescriptions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Prescriptions</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prescription Management</CardTitle>
            <CardDescription>
              View and manage patient prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row items-center justify-between mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search prescriptions, patients, or medications..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
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

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading prescriptions...</span>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RX ID</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage & Frequency</TableHead>
                        <TableHead>Prescribed By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPrescriptions.length > 0 ? (
                        currentPrescriptions.map((prescription) => (
                          <TableRow key={prescription.id}>
                            <TableCell className="font-medium">
                              {prescription.code}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center">
                                <Pill className="h-3 w-3 mr-1 text-health-500" />
                                {prescription.medication}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{prescription.dosage}</span>
                                <span className="text-xs text-muted-foreground">
                                  {prescription.dosage}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{prescription.doctor}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarDays className="h-3 w-3 mr-1 text-muted-foreground" />
                                {prescription.prescription_date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(
                                    prescription.status
                                  )}`}
                                >
                                  {prescription.status}
                                </span>
                                {prescription.refills_remaining > 0 && (
                                  <span className="ml-2 text-xs">
                                    {prescription.refills_remaining} refill{prescription.refills_remaining !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    disabled={loading}
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/prescriptions/${prescription.id}`}>
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/prescriptions/${prescription.id}/edit`}>
                                      Edit Prescription
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    <div className="flex items-center">
                                      <Clipboard className="h-4 w-4 mr-2" />
                                      Print Prescription
                                    </div>
                                  </DropdownMenuItem>
                                  {prescription.status === "Active" && (
                                    <DropdownMenuItem className="text-red-500">
                                      Discontinue Prescription
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No prescriptions found
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
                        { length: Math.ceil(filteredPrescriptions.length / prescriptionsPerPage) },
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
                              Math.ceil(filteredPrescriptions.length / prescriptionsPerPage)
                            )
                              paginate(currentPage + 1);
                          }}
                          className={
                            currentPage >=
                            Math.ceil(filteredPrescriptions.length / prescriptionsPerPage) || loading
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prescriptions;
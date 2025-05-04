import { useState, useEffect, useRef } from "react";
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
  Loader2,
  Printer,
  X
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
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [prescriptionsData, setPrescriptionsData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const { toast } = useToast();
  const prescriptionsPerPage = 8;
  const printRef = useRef<HTMLDivElement>(null);
  const pagePrintRef = useRef<HTMLDivElement>(null);

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
          prescription_date: item.prescription_date || "N/A",
          status: item.status || "Unknown",
          instruction: item.instruction || "N/A",
          date_filled: item.date_filled || "N/A",
          refills_remaining: item.refills_remaining || 0,
          date_prescribed: item.date_prescribed || "N/A",
          code: item.code || "N/A",
          patient: item.patient || "Unknown", // Added patient property
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
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [id, toast]);

  const filteredPrescriptions = prescriptionsData.filter((prescription) => {
    const matchesSearch =
      prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.instruction.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || prescription.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastPrescription = currentPage * prescriptionsPerPage;
  const indexOfFirstPrescription = indexOfLastPrescription - prescriptionsPerPage;
  const currentPrescriptions = filteredPrescriptions.slice(
    indexOfFirstPrescription,
    indexOfLastPrescription
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  const handlePrintPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrintModal(true);
  };

  const printSinglePrescription = () => {
    if (!printRef.current || !selectedPrescription) return;
    
    setPrinting(true);
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${selectedPrescription.code}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1, h2, h3 { color: #333; }
              .header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; color: #555; }
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            ${printRef.current.innerHTML}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 200);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setPrinting(false);
    setShowPrintModal(false);
  };

  const handlePrintPage = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 200);
  };

  return (
    <div className="container py-8" ref={pagePrintRef}>
      {/* Print Prescription Modal */}
      {showPrintModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Prescription Details</h2>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div ref={printRef} className="p-4">
              <div className="mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-center">Prescription</h1>
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="font-semibold">RX Number:</p>
                    <p>{selectedPrescription.code}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Date:</p>
                    <p>{selectedPrescription.prescription_date}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-500">Medication</h3>
                    <div className="flex items-center">
                      <Pill className="h-4 w-4 mr-2 text-health-500" />
                      <span>{selectedPrescription.medication}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Dosage</h3>
                    <p>{selectedPrescription.dosage}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Instructions</h3>
                    <p>{selectedPrescription.instruction}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-500">Prescribed By</h3>
                    <p>{selectedPrescription.doctor}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Status</h3>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyles(selectedPrescription.status)}`}>
                        {selectedPrescription.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Refills Remaining</h3>
                    <p>{selectedPrescription.refills_remaining}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={printSinglePrescription} disabled={printing}>
                {printing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Printer className="h-4 w-4 mr-2" />
                )}
                Print Prescription
              </Button>
              <Button onClick={() => setShowPrintModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Prescriptions</h1>
          <Button 
            onClick={handlePrintPage}
            variant="outline"
            disabled={printing}
            className="print:hidden"
          >
            {printing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Printer className="h-4 w-4 mr-2" />
            )}
            Print Page
          </Button>
        </div>

        <Card className="print:border-none print:shadow-none">
          <CardHeader className="print:hidden">
            <CardTitle>Prescription Management</CardTitle>
            <CardDescription>
              View and manage patient prescriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row items-center justify-between mb-6 print:hidden">
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
                <div className="rounded-md border print:border-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RX ID</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Dosage & Frequency</TableHead>
                        <TableHead>Prescribed By</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px] print:hidden"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPrescriptions.length > 0 ? (
                        currentPrescriptions.map((prescription) => (
                          <TableRow key={prescription.id} className="print:hover:bg-white">
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
                                  {prescription.instruction}
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
                            <TableCell className="print:hidden">
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
                                  <DropdownMenuItem onClick={() => handlePrintPrescription(prescription)}>
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

                <div className="mt-4 print:hidden">
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

      {/* Print styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .container, .container * {
              visibility: visible;
            }
            .container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
            }
            .no-print, .print-hidden, .print\\:hidden {
              display: none !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            th {
              background-color: #f2f2f2;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Prescriptions;
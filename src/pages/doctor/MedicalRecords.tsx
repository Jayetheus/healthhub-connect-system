import { useEffect, useState, useRef } from "react";
import ReactToPrint from "react-to-print";
import { Link } from "react-router-dom";
import {
  FileText,
  SearchIcon,
  MoreHorizontal,
  UserRound,
  CalendarDays,
  RefreshCcw,
  X,
  Loader2,
  TestTube,
  Notebook,
  Stethoscope,
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
import { useToast } from "@/hooks/use-toast";
import { getPatientRecords, PatientRecord } from "@/api/patientApi";
import { useUser } from "@/contexts/UserContext";



const MedicalRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [medicalRecordsData, setMedicalRecordsData] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false)
  const { toast } = useToast();
  const recordsPerPage = 8;
  const { name, surname } = useUser();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await getPatientRecords("doctor");
        setMedicalRecordsData(data)
        console.log(data)
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

    fetchRecords();
  }, [toast]);

  const filteredRecords = medicalRecordsData.filter((record) => {
    const matchesSearch =
      record.patient_record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment[0].diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment[0]?.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || record.type === selectedType;

    return matchesSearch && matchesType;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "Note":
        return <Notebook className="h-4 w-4 text-blue-500" />;
      case "Lab Result":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "Examination":
        return <Stethoscope className="h-4 w-4 text-green-500" />;
      case "Procedure":
        return <TestTube className="h-4 w-4 text-red-500" />;
      case "Imaging":
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const openRecordModal = (record: PatientRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await getPatientRecords("doctor");
      setMedicalRecordsData(data);
      setSearchTerm("");
      setSelectedType("all");
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to refresh records:", error);
      toast({
        title: "Error",
        description: "Failed to refresh records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrinting(true)

    if (printRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Medical Record - ${selectedRecord?.type}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; color: #555; }
                .header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media print {
                  body { -webkit-print-color-adjust: exact; }
                  button { display: none !important; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 200);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        setPrinting(false)
      }
    }
  };

  return (
    <div className="container py-8">
      {/* Print Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedRecord.type} Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div ref={printRef} className="p-4">
              <div className="mb-6 border-b pb-4">
                <h1 className="text-2xl font-bold text-center">Medical Record</h1>
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="font-semibold">Patient:</p>
                    <p>{selectedRecord.name +  " " + selectedRecord.surname}</p> {/* Replace with actual patient name */}
                  </div>
                  <div>
                    <p className="font-semibold">Date:</p>
                    <p>{selectedRecord.date}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-gray-500">Patient ID</h3>
                    <p>{selectedRecord.patient_record_id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Doctor</h3>
                    <p>{selectedRecord.doctor}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Record Type</h3>
                    <div className="flex items-center">
                      {getRecordTypeIcon(selectedRecord.type)}
                      <span className="ml-2">{selectedRecord.type}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Description</h3>
                    <p>{selectedRecord.description}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-500">Diagnosis</h3>
                    <p>{selectedRecord.treatment[0]?.diagnosis || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Date</h3>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedRecord.date}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Details</h3>
                    <p>{selectedRecord.details || "No additional details available"}</p>
                  </div>
                </div>

                {selectedRecord.treatment[0] && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-500">Treatment Description</h3>
                      <p>{selectedRecord.treatment[0].description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500">Treatment Date</h3>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedRecord.treatment[0].date}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500">Treatment Follow Up Date</h3>
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedRecord.treatment[0].follow_up_date}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handlePrint}>
              { printing ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin"/>
                  <span>Printing...</span>
                </>
              ) : (
                <p>Print Record</p>
              )
              }
            </Button>
              <Button onClick={() => setShowModal(false)}>
              { printing ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin"/>
                </>
              ) : (
                <p>Cancel</p>
              )
              } 
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Medical Records</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Medical Records Database</CardTitle>
            <CardDescription>
              View and manage patient medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row items-center justify-between mb-6">
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search records, patients, or diagnoses..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                  disabled={loading}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Record type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Note">Notes</SelectItem>
                    <SelectItem value="Lab Result">Lab Results</SelectItem>
                    <SelectItem value="Procedure">Procedure</SelectItem>
                    <SelectItem value="Examination">Examination</SelectItem>
                    <SelectItem value="Imaging">Imaging</SelectItem>
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
                <span className="ml-2">Loading medical records...</span>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead>Patient ID</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Record Type</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRecords.length > 0 ? (
                        currentRecords.map((record, index) => (
                          <TableRow 
                            key={index}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => openRecordModal(record)}
                          >  

                            <TableCell>
                              <div className="flex items-center">
                                <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="font-medium">{record.patient_record_id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <UserRound className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="font-medium">{record.doctor}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getRecordTypeIcon(record.type)}
                                <span className="ml-2">{record.type}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="line-clamp-1">
                                {record.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.treatment[0]?.diagnosis || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <CalendarDays className="h-3 w-3 mr-1 text-muted-foreground" />
                                {record.date}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRecordModal(record);
                                }}
                                disabled={loading}
                              >
                                <span className="sr-only">View details</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No medical records found
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
                        { length: Math.ceil(filteredRecords.length / recordsPerPage) },
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
                              Math.ceil(filteredRecords.length / recordsPerPage)
                            )
                              paginate(currentPage + 1);
                          }}
                          className={
                            currentPage >=
                            Math.ceil(filteredRecords.length / recordsPerPage) || loading
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

export default MedicalRecords;
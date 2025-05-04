
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BadgeCheck, Filter, MoreHorizontal, PlusCircle, Search } from "lucide-react";

// Sample patient data
const patientsData = [
  {
    id: "P001",
    name: "John Smith",
    age: 45,
    gender: "Male",
    lastVisit: "2025-04-10",
    phone: "(555) 123-4567",
    status: "Active",
  },
  {
    id: "P002",
    name: "Sarah Johnson",
    age: 32,
    gender: "Female",
    lastVisit: "2025-04-12",
    phone: "(555) 234-5678",
    status: "Active",
  },
  {
    id: "P003",
    name: "Robert Wilson",
    age: 58,
    gender: "Male",
    lastVisit: "2025-04-05",
    phone: "(555) 345-6789",
    status: "Inactive",
  },
  {
    id: "P004",
    name: "Emily Davis",
    age: 29,
    gender: "Female",
    lastVisit: "2025-04-08",
    phone: "(555) 456-7890",
    status: "Active",
  },
  {
    id: "P005",
    name: "Michael Brown",
    age: 42,
    gender: "Male",
    lastVisit: "2025-04-01",
    phone: "(555) 567-8901",
    status: "Active",
  },
  {
    id: "P006",
    name: "Jennifer Lee",
    age: 37,
    gender: "Female",
    lastVisit: "2025-04-09",
    phone: "(555) 678-9012",
    status: "Active",
  },
  {
    id: "P007",
    name: "David Martinez",
    age: 51,
    gender: "Male",
    lastVisit: "2025-03-28",
    phone: "(555) 789-0123",
    status: "Inactive",
  },
  {
    id: "P008",
    name: "Lisa Anderson",
    age: 34,
    gender: "Female",
    lastVisit: "2025-04-07",
    phone: "(555) 890-1234",
    status: "Active",
  },
  {
    id: "P009",
    name: "James Taylor",
    age: 47,
    gender: "Male",
    lastVisit: "2025-04-03",
    phone: "(555) 901-2345",
    status: "Active",
  },
  {
    id: "P010",
    name: "Patricia White",
    age: 63,
    gender: "Female",
    lastVisit: "2025-03-25",
    phone: "(555) 012-3456",
    status: "Inactive",
  },
];

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 8;

  // Filter patients based on search term
  const filteredPatients = patientsData.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  // Get current patients
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Patients</h1>
          <Button asChild>
            <Link to="/patients/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Patient
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Directory</CardTitle>
            <CardDescription>
              View and manage all patient records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search patients..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">
                        {patient.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="hover:underline font-medium text-health-700 dark:text-health-400"
                          >
                            {patient.name}
                          </Link>
                          {patient.status === "Active" && (
                            <BadgeCheck className="h-4 w-4 ml-1 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>{patient.lastVisit}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            patient.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/patients/${patient.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/patients/${patient.id}/edit`}>
                                Edit Patient
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/medical-records/${patient.id}`}>
                                Medical Records
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/appointments/new?patient=${patient.id}`}>
                                Schedule Appointment
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
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
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from(
                    { length: Math.ceil(filteredPatients.length / patientsPerPage) },
                    (_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          isActive={currentPage === i + 1}
                          onClick={() => paginate(i + 1)}
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
                          Math.ceil(filteredPatients.length / patientsPerPage)
                        )
                          paginate(currentPage + 1);
                      }}
                      className={
                        currentPage >=
                        Math.ceil(filteredPatients.length / patientsPerPage)
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Patients;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2, Pill, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/components/ui/use-toast";
import { issuePrescription,getPharmacistPrescriptions, getMedications, Medication, Prescription } from "@/api/patientApi";



export function PharmacistDashboard() {
  const { name, surname } = useUser();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medication, setMedication] = useState<Medication[]>([]);
  const [loading, setLoading] = useState({
    prescriptions: true,
    inventory: true,
    issuePrescription: false,
    printRestock: false,
  });
  const [error, setError] = useState({
    prescriptions: "",
    inventory: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedForRestock, setSelectedForRestock] = useState<Medication[]>([]);

  // Fetch pharmacist's prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
          const data = await getPharmacistPrescriptions();
          setPrescriptions(data);
      } catch (err) {
        setError(prev => ({
          ...prev,
          prescriptions: err instanceof Error ? err.message : "Failed to load prescriptions"
        }));
      } finally {
        setLoading(prev => ({ ...prev, prescriptions: false }));
      }
    };
    fetchPrescriptions();
  }, []);

  // Fetch medication inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getMedications();
        setMedication(data);
      } catch (err) {
        setError(prev => ({
          ...prev,
          inventory: err instanceof Error ? err.message : "Failed to load inventory"
        }));
      } finally {
        setLoading(prev => ({ ...prev, inventory: false }));
      }
    };

    fetchInventory();
  }, []);

  // Filter prescriptions based on search and tab
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      (activeTab === "pending" && prescription.status.toLowerCase() === "pending") ||
      (activeTab === "expired" && prescription.status.toLowerCase() === "expired") ||
      (activeTab === "filled" && prescription.status.toLowerCase() === "filled");
    
    return matchesSearch && matchesStatus;
  });

  // Calculate inventory summary
  const inventorySummary = {
    totalItems: medication.length,
    lowStock: medication.filter(item => item.in_stock < 50).length,
    outOfStock: medication.filter(item => item.in_stock === 0).length
  };

  const handleIssuePrescription = async (prescriptionId: string) => {
    try {
      setLoading(prev => ({ ...prev, issuePrescription: true }));
      // Call API to issue prescription
      await issuePrescription(prescriptionId);

      const data = await getPharmacistPrescriptions();
      setPrescriptions(data);
      toast({
        title: "Success",
        description: "Prescription issued successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to issue prescription",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, issuePrescription: false }));
    }
  };

  const handlePrintRestockList = () => {
    // Get low stock items (or use selectedForRestock if you implement selection)
    const lowStockItems = medication.filter(item => item.in_stock < 50);
    setLoading(prev => ({ ...prev, printRestock: true }));
    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>Restock List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Medication Restock List</h1>
            <p>Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Current Stock</th>
                <th>Reorder Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.in_stock}</td>
                  <td>${50 - item.in_stock}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        <footer style={background-color: "#f2f2f2"; padding: "10px"; text-align: "center"; position: "fixed"; bottom: 0; width: "100%"}>
          <p style="font-size: 12px; color: #777;">Generated by HealthHub: AJ Nhlapho's Company</p>
          <p style="font-size: 12px; color: #777;">&copy; 2025 Jayethian Projects. All rights reserved.</p>
        </footer>
      </html>
    `;
  
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.focus();
    setTimeout(() => {
      printWindow?.print();
      printWindow?.close();
    }, 500);
    setLoading(prev => ({ ...prev, printRestock: false }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Pharmacist Dashboard</h1>
          <p className="text-muted-foreground">
            {name && surname ? `Welcome, ${name + " "+ surname }` : "Managing medications and prescriptions"}
          </p>
        </div>
      </div>

      {/* Inventory Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Medication Inventory Summary</CardTitle>
          <CardDescription>Current stock status of medications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.inventory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error.inventory ? (
            <div className="text-center py-4 text-red-500">{error.inventory}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Medications</h3>
                <p className="text-2xl font-bold">{inventorySummary.totalItems}</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Low Stock</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {inventorySummary.lowStock}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium text-muted-foreground">Out of Stock</h3>
                <p className="text-2xl font-bold text-red-600">
                  {inventorySummary.outOfStock}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prescriptions Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Prescriptions Management</CardTitle>
              <CardDescription>
                {activeTab === "pending" 
                  ? "Prescriptions awaiting fulfillment" 
                  : "Recently issued prescriptions"}
              </CardDescription>
            </div>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search prescriptions..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending
                <Badge variant="secondary" className="ml-2">
                  {prescriptions.filter(p => p.status.toLowerCase() === "pending").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="filled">
                Filled
                <Badge variant="secondary" className="ml-2">
                  {prescriptions.filter(p => p.status.toLowerCase() === "filled").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="expired">
                Expired
                <Badge variant="secondary" className="ml-2">
                  {prescriptions.filter(p => p.status.toLowerCase() === "expired").length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {loading.prescriptions ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error.prescriptions ? (
              <div className="text-center py-8 text-red-500">{error.prescriptions}</div>
            ) : (
              <>
                <TabsContent value="pending" className="pt-4">
                  {filteredPrescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredPrescriptions.map((prescription) => (
                        <div key={prescription.id} className="border rounded-lg p-4 hover:bg-muted/50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <h3 className="font-medium">{prescription.patient}</h3>
                              <p className="text-sm text-muted-foreground">
                                {prescription.medication} • {prescription.dosage}
                              </p>
                              <p className="text-sm mt-1">{prescription.instruction}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Prescribed by {prescription.doctor} on {new Date(prescription.prescription_date).toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              onClick={() => handleIssuePrescription(prescription.id)}
                              className="w-full md:w-auto"
                            >{
                              loading.issuePrescription ?(
                                <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span >Issuing Prescription</span>
                                </>
                              ) : (
                                <>
                                <Plus className="h-4 w-4 mr-2" /> 
                                <span >Issue Prescription</span>
                                </>
                              )
                            }
                              
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Pill className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No pending prescriptions found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery ? "Try a different search term" : "All prescriptions are up to date"}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="filled" className="pt-4">
                  {filteredPrescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredPrescriptions.map((prescription) => (
                        <div key={prescription.id} className="border rounded-lg p-4 hover:bg-muted/50">
                          <div>
                            <h3 className="font-medium">{prescription.patient}</h3>
                            <p className="text-sm text-muted-foreground">
                              {prescription.medication} • {prescription.dosage}
                            </p>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2">
                              <p className="text-sm">{prescription.instruction}</p>
                              <p className="text-xs text-muted-foreground">
                                Issued on {prescription.prescription_date ? new Date(prescription.prescription_date).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Pill className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No issued prescriptions found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery ? "Try a different search term" : "No prescriptions have been issued recently"}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="expired" className="pt-4">
                  {filteredPrescriptions.length > 0 ? (
                    <div className="space-y-3">
                      {filteredPrescriptions.map((prescription) => (
                        <div key={prescription.id} className="border rounded-lg p-4 hover:bg-muted/50">
                          <div>
                            <h3 className="font-medium">{prescription.patient}</h3>
                            <p className="text-sm text-muted-foreground">
                              {prescription.medication} • {prescription.dosage}
                            </p>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-2 gap-2">
                              <p className="text-sm">{prescription.instruction}</p>
                              <p className="text-xs text-muted-foreground">
                                Issued on {prescription.prescription_date ? new Date(prescription.prescription_date).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Pill className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No expired prescriptions found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery ? "Try a different search term" : "No prescriptions have been issued recently"}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Low Stock Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Medications</CardTitle>
          <CardDescription>Items that need replenishment</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.inventory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error.inventory ? (
            <div className="text-center py-4 text-red-500">{error.inventory}</div>
          ) : medication.filter(item => item.in_stock < 50).length > 0 ? (
            <div className="space-y-3">
              {medication
                .filter(item => item.in_stock < 50)
                .sort((a, b) => a.in_stock - b.in_stock)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Pill className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                      </div>
                    </div>
                    <Badge accessKey={item.in_stock === 0 ? "destructive" : "warning"}>
                      {item.in_stock === 0 ? "Out of stock" : `Low stock (${item.in_stock})`}
                    </Badge>
                  </div>
                ))}
              <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={handlePrintRestockList}
                >{
                  loading.printRestock ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span >Printing...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" /> 
                      <span >Print Restock List</span>
                    </>
                  )

                }
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Pill className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-muted-foreground">All medications are sufficiently stocked</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
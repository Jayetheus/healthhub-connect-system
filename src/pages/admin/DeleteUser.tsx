import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Trash2, ArrowLeft, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { getUserAccounts } from "@/api/patientApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function DeleteUser() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {

        const fetchUsers = async () => {
          try {
            const response = await getUserAccounts();
            setUser(response);
          } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred");
          } finally {
            setLoading(false);
          }
        };
    
        fetchUsers();
  }, [userId, navigate]);

  const handleDeleteUser = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast({
        title: "Success",
        description: `${user.name} has been deleted successfully`,
      });
      navigate("/admin/users");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" asChild className="mb-6">
          <Link to="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>

        <Card className="border-red-100">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <div className="rounded-lg bg-red-100 p-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <CardTitle>Delete User Account</CardTitle>
                <CardDescription>
                  This action cannot be undone. All user data will be permanently removed.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm text-gray-500">Role: {user.role}</p>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Warning</h4>
                <p className="text-sm text-red-700">
                  Deleting this account will permanently remove all associated data. 
                  This includes any records, permissions, and settings tied to this user.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <Link to="/admin/users">
                    Cancel
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteUser}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Confirm Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
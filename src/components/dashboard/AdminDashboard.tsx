import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserAccounts } from "@/api/patientApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUserAccounts();
        setUsers(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      
      // Remove the user from local state
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Account Management</h1>
          <div className="flex space-x-2">
            <Button asChild>
              <Link to="/users/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User Account
              </Link>
            </Button>
          </div>
        </div>

        {/* User Management Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Add User Account Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <PlusCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Add User</CardTitle>
                  <CardDescription>Create new user accounts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/users/add">
                  Go to Add User
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Edit User Account Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-orange-100 p-3">
                  <Pencil className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle>Edit User</CardTitle>
                  <CardDescription>Modify existing accounts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/edit">
                  Go to Edit User
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Delete User Account Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-red-100 p-3">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle>Delete User</CardTitle>
                  <CardDescription>Remove user accounts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="destructive" className="w-full">
                <Link to="/admin/delete">
                  Go to Delete User
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              List of all system users with their roles and names
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          asChild
                        >
                          <Link to={`/users/edit/${user.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
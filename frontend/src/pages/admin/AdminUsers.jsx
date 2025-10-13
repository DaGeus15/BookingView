import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AdminUsers = () => {
  const { getToken } = useAppContext();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const token = await getToken();
    try {
      const res = await axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.users);
    } catch (error) {
      toast.error("Error fetching users");
      console.error(error);
    }
  };

  const toggleUserActive = async (userId) => {
    const token = await getToken();
    try {
      await axios.post("/api/admin/users/toggle", { userId }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers((prev) => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
      toast.success("User status updated");
    } catch (error) {
      toast.error("Error updating user");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="overflow-x-auto shadow rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Username</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Role</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Active</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{u.username}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">{u.role}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => toggleUserActive(u._id)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
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
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleUserActive = async (userId) => {
    const token = await getToken();
    try {
      await axios.post("/api/admin/users/toggle", { userId }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 text-left">Username</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Role</th>
            <th className="py-2 px-4 text-left">Active</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id} className="border-b">
              <td className="py-2 px-4">{u.username}</td>
              <td className="py-2 px-4">{u.email}</td>
              <td className="py-2 px-4">{u.role}</td>
              <td className="py-2 px-4">{u.isActive ? "Yes" : "No"}</td>
              <td className="py-2 px-4">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded mr-2"
                  onClick={() => toggleUserActive(u._id)}
                >
                  Toggle Active
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;

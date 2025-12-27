"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  recipeCount?: number;
  createdAt: string;
  bio?: string;
}

interface Role {
  _id: string;
  role: string;
  description: string;
  permissions: string[];
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState("");
  const itemsPerPage = 20;

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role || "user");
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !newRole || !currentUser) return;

    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, actorId: currentUser._id }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Cập nhật role thành công!");
        setShowRoleModal(false);
        fetchUsers();
      } else {
        alert(data.message || "Lỗi khi cập nhật role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Lỗi khi cập nhật role");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Đã xóa người dùng thành công!");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Có lỗi xảy ra khi xóa người dùng!");
    }
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: "bg-red-100 text-red-700",
      seller: "bg-green-100 text-green-700",
      creator: "bg-purple-100 text-purple-700",
      moderator: "bg-blue-100 text-blue-700",
      partner: "bg-yellow-100 text-yellow-700",
      affiliate: "bg-pink-100 text-pink-700",
      support: "bg-indigo-100 text-indigo-700",
      user: "bg-gray-100 text-gray-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  const filteredUsers = users.filter(
    (user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesRole;
    }
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
        <nav className="text-sm text-gray-600">
          <Link href="/admin" className="hover:text-blue-600">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span>Người dùng</span>
        </nav>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách người dùng
            </h2>
            <Link
              href="/admin/users/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Thêm người dùng
            </Link>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filter */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="search"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="all">Tất cả vai trò</option>
              {roles.map((role) => (
                <option key={role._id} value={role.role}>
                  {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Tên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Vai trò
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Công thức
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            user.role || "user"
                          )}`}
                        >
                          {user.role
                            ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                            : "User"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.recipeCount || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/users/permissions/${user._id}`}
                            className="px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            title="Quyền chi tiết"
                          >
                            🔐
                          </Link>
                          <button
                            onClick={() => handleChangeRole(user)}
                            className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Đổi vai trò"
                          >
                            Role
                          </button>
                          <Link
                            href={`/admin/users/${user._id}`}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            Sửa
                          </Link>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} / {filteredUsers.length} người dùng
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đổi vai trò</h2>
            
            <div className="mb-6">
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Người dùng:</div>
                <div className="font-semibold text-gray-800">{selectedUser.name}</div>
                <div className="text-sm text-gray-500">{selectedUser.email}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Vai trò hiện tại:</div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(selectedUser.role || "user")}`}>
                  {selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : "User"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Chọn vai trò mới:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                >
                  {roles.map((role) => (
                    <option key={role._id} value={role.role}>
                      {role.role.charAt(0).toUpperCase() + role.role.slice(1)} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {newRole && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-800 mb-2">Quyền hạn sẽ có:</div>
                  <div className="flex flex-wrap gap-1">
                    {roles.find((r) => r.role === newRole)?.permissions.slice(0, 6).map((perm, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white text-blue-700 text-xs rounded border border-blue-300">
                        {perm}
                      </span>
                    ))}
                    {(roles.find((r) => r.role === newRole)?.permissions.length || 0) > 6 && (
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded font-medium">
                        +{(roles.find((r) => r.role === newRole)?.permissions.length || 0) - 6} khác
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveRole}
                disabled={newRole === selectedUser.role}
                className={`flex-1 px-6 py-3 rounded-lg transition-colors font-semibold ${newRole === selectedUser.role ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-orange-500 text-white hover:bg-orange-600"}`}
              >
                Lưu thay đổi
              </button>
              <button
                onClick={() => setShowRoleModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { PERMISSION_GROUPS, getPermissionLabel } from "@/lib/permissions";

interface Role {
  _id: string;
  role: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function RolesManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchRoles();
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditForm({
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowEditModal(true);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleTogglePermission = (permissionKey: string) => {
    setEditForm((prev) => {
      const hasPermission = prev.permissions.includes(permissionKey);
      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter((p) => p !== permissionKey)
          : [...prev.permissions, permissionKey],
      };
    });
  };

  const handleToggleGroup = (groupPermissions: string[]) => {
    setEditForm((prev) => {
      const allSelected = groupPermissions.every((p) =>
        prev.permissions.includes(p)
      );
      if (allSelected) {
        // Deselect all in group
        return {
          ...prev,
          permissions: prev.permissions.filter(
            (p) => !groupPermissions.includes(p)
          ),
        };
      } else {
        // Select all in group
        const newPerms = [...prev.permissions];
        groupPermissions.forEach((p) => {
          if (!newPerms.includes(p)) {
            newPerms.push(p);
          }
        });
        return { ...prev, permissions: newPerms };
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedRole) return;

    try {
      const res = await fetch(`/api/admin/roles/${selectedRole._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (data.success) {
        alert("Cập nhật role thành công!");
        setShowEditModal(false);
        fetchRoles();
      } else {
        alert(data.message || "Lỗi khi cập nhật role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Lỗi khi cập nhật role");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;

    try {
      const res = await fetch(`/api/admin/roles/${selectedRole._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Xóa role thành công!");
        setShowDeleteModal(false);
        fetchRoles();
      } else {
        alert(data.message || "Lỗi khi xóa role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Lỗi khi xóa role");
    }
  };

  if (loading || loadingRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/admin" className="text-gray-600 hover:text-orange-500">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              Quản lý Phân quyền (RBAC)
            </h1>
          </div>
          <p className="text-gray-600">
            Quản lý các vai trò và quyền hạn trong hệ thống
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => {
            const isSystemRole = ["admin", "user", "seller"].includes(role.role);
            
            return (
              <div
                key={role._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                {/* Role Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-800 capitalize">
                        {role.role}
                      </h3>
                      {isSystemRole && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          Hệ thống
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Quyền hạn ({role.permissions.length}):
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map((perm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {perm}
                        </span>
                      ))}
                      {role.permissions.length > 5 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded font-medium">
                          +{role.permissions.length - 5} khác
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role)}
                    disabled={isSystemRole}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      isSystemRole
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Chỉnh sửa Role: <span className="text-orange-500 capitalize">{selectedRole.role}</span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Đã chọn {editForm.permissions.length} quyền
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả vai trò
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    rows={2}
                    placeholder="Mô tả ngắn gọn về vai trò này..."
                  />
                </div>

                {/* Permissions by Group */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      Quyền hạn
                    </label>
                    <div className="text-xs text-gray-500">
                      Tick vào ô để chọn quyền
                    </div>
                  </div>

                  <div className="space-y-4">
                    {PERMISSION_GROUPS.map((group) => {
                      const groupPermKeys = group.permissions.map((p) => p.key);
                      const selectedCount = groupPermKeys.filter((k) =>
                        editForm.permissions.includes(k)
                      ).length;
                      const allSelected = selectedCount === groupPermKeys.length;
                      const someSelected = selectedCount > 0 && !allSelected;

                      return (
                        <div
                          key={group.domain}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Group Header */}
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{group.icon}</span>
                              <div>
                                <h3 className="font-semibold text-gray-800">
                                  {group.label}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {selectedCount}/{groupPermKeys.length} đã chọn
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleGroup(groupPermKeys)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                allSelected
                                  ? "bg-orange-500 text-white hover:bg-orange-600"
                                  : someSelected
                                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              {allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                            </button>
                          </div>

                          {/* Permissions */}
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {group.permissions.map((perm) => {
                                const isChecked = editForm.permissions.includes(
                                  perm.key
                                );
                                return (
                                  <label
                                    key={perm.key}
                                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                      isChecked
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() =>
                                        handleTogglePermission(perm.key)
                                      }
                                      className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-800 text-sm">
                                        {perm.label}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-0.5">
                                        {perm.description}
                                      </div>
                                      <code className="text-xs text-gray-400 mt-1 inline-block">
                                        {perm.key}
                                      </code>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  💾 Lưu thay đổi
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Xác nhận xóa
              </h2>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa role{" "}
                <span className="font-bold">{selectedRole.role}</span>?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Xóa
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

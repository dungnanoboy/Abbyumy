"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { PERMISSION_GROUPS, getPermissionLabel } from "@/lib/permissions";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
  customPermissions?: string[];
}

interface Role {
  _id: string;
  role: string;
  description: string;
  permissions: string[];
}

export default function UserPermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [effectivePermissions, setEffectivePermissions] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "admin")) {
      router.push("/admin");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (params.id && currentUser?.role === "admin") {
      fetchUser();
      fetchRoles();
    }
  }, [params.id, currentUser]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setCustomPermissions(data.user.customPermissions || []);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
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

  useEffect(() => {
    if (user && roles.length > 0) {
      calculateEffectivePermissions();
    }
  }, [user, roles, customPermissions]);

  const calculateEffectivePermissions = () => {
    if (!user) return;

    const role = roles.find((r) => r.role === user.role);
    const rolePerms = role?.permissions || [];
    
    // Check for wildcard permission
    if (rolePerms.includes("*") || customPermissions.includes("*")) {
      // Has full access - show all permissions
      const allPerms = PERMISSION_GROUPS.flatMap(g => g.permissions.map(p => p.key));
      setEffectivePermissions(allPerms);
      return;
    }
    
    // Combine role permissions + custom permissions
    const combined = [...new Set([...rolePerms, ...customPermissions])];
    setEffectivePermissions(combined);
  };

  const handleTogglePermission = (permissionKey: string) => {
    setCustomPermissions((prev) => {
      const hasPermission = prev.includes(permissionKey);
      return hasPermission
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey];
    });
  };

  const handleSaveCustomPermissions = async () => {
    if (!currentUser) return;
    
    try {
      const res = await fetch(`/api/admin/users/${params.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customPermissions, actorId: currentUser._id }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Cập nhật quyền cá nhân thành công!");
        setShowPermissionModal(false);
        fetchUser();
      } else {
        alert(data.message || "Lỗi khi cập nhật quyền");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      alert("Lỗi khi cập nhật quyền");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy người dùng</p>
          <Link href="/admin/users" className="text-orange-500 hover:underline mt-4 inline-block">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const userRole = roles.find((r) => r.role === user.role);
  const rolePermissions = userRole?.permissions || [];
  const hasWildcard = rolePermissions.includes("*") || customPermissions.includes("*");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/admin/users" className="text-gray-600 hover:text-orange-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">Quản lý Quyền hạn</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Vai trò:</div>
                  <div className="font-semibold text-gray-800 capitalize">{user.role}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Ngày tham gia:</div>
                  <div className="text-gray-800 text-sm">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <Link
                  href={`/admin/users/${user._id}`}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center block text-sm"
                >
                  Sửa thông tin
                </Link>
                <Link
                  href={`/profile/${user._id}`}
                  target="_blank"
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center block text-sm"
                >
                  Xem trang cá nhân
                </Link>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wildcard Notice */}
            {hasWildcard && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">⭐</div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800 mb-1">
                      Toàn quyền (Wildcard *)
                    </h3>
                    <p className="text-sm text-red-700">
                      Người dùng này có quyền "*" - được phép thực hiện MỌI hành động trong hệ thống.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Effective Permissions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Quyền hiệu lực</h3>
                  <p className="text-sm text-gray-600">
                    Tổng hợp: Vai trò <span className="font-semibold capitalize">({user.role})</span> + Quyền cá nhân
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-500">
                    {hasWildcard ? "∞" : effectivePermissions.length}
                  </div>
                  <div className="text-xs text-gray-500">quyền</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {effectivePermissions.length === 0 ? (
                  <p className="text-gray-500 text-center w-full py-8">
                    Người dùng chưa có quyền nào
                  </p>
                ) : (
                  effectivePermissions.map((perm) => {
                    const isFromRole = rolePermissions.includes(perm);
                    const isCustom = customPermissions.includes(perm);
                    
                    return (
                      <span
                        key={perm}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isCustom && !isFromRole
                            ? "bg-purple-100 text-purple-700 border border-purple-300"
                            : "bg-blue-100 text-blue-700 border border-blue-300"
                        }`}
                        title={
                          isCustom && !isFromRole
                            ? "Quyền cá nhân"
                            : "Quyền từ vai trò"
                        }
                      >
                        {getPermissionLabel(perm)}
                        {isCustom && !isFromRole && " ⭐"}
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Role Permissions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                📦 Quyền từ vai trò: <span className="text-orange-500 capitalize">{user.role}</span>
              </h3>
              {userRole && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">{userRole.description}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {rolePermissions.length === 0 ? (
                  <p className="text-gray-500 text-sm">Vai trò này chưa có quyền nào</p>
                ) : (
                  rolePermissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-300"
                    >
                      {perm === "*" ? "⭐ Toàn quyền" : getPermissionLabel(perm)}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Custom Permissions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">⭐ Quyền cá nhân</h3>
                  <p className="text-sm text-gray-600">
                    Quyền bổ sung riêng cho người dùng này
                  </p>
                </div>
                <button
                  onClick={() => setShowPermissionModal(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  ⚙️ Chỉnh sửa
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {customPermissions.length === 0 ? (
                  <div className="w-full text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 text-sm mb-2">
                      Chưa có quyền cá nhân nào
                    </p>
                    <button
                      onClick={() => setShowPermissionModal(true)}
                      className="text-purple-600 hover:underline text-sm font-medium"
                    >
                      + Thêm quyền bổ sung
                    </button>
                  </div>
                ) : (
                  customPermissions.map((perm) => (
                    <span
                      key={perm}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-300"
                    >
                      {perm === "*" ? "⭐ Toàn quyền" : `${getPermissionLabel(perm)} ⭐`}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Permissions Modal */}
        {showPermissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      ⭐ Quyền cá nhân cho: {user.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Đã chọn {customPermissions.length} quyền bổ sung
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPermissionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-semibold text-yellow-800 mb-1">Lưu ý:</div>
                      <p className="text-sm text-yellow-700">
                        Quyền cá nhân sẽ được <strong>CỘNG THÊM</strong> vào quyền từ vai trò "{user.role}". 
                        Các quyền đã có từ vai trò sẽ hiển thị với nền xanh và không thể bỏ chọn.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupPermKeys = group.permissions.map((p) => p.key);
                    const selectedInGroup = groupPermKeys.filter((k) =>
                      customPermissions.includes(k)
                    ).length;

                    return (
                      <div
                        key={group.domain}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{group.icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-800">{group.label}</h3>
                              {selectedInGroup > 0 && (
                                <p className="text-xs text-purple-600 font-medium">
                                  +{selectedInGroup} quyền bổ sung
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {group.permissions.map((perm) => {
                              const isChecked = customPermissions.includes(perm.key);
                              const isFromRole = rolePermissions.includes(perm.key) || rolePermissions.includes("*");

                              return (
                                <label
                                  key={perm.key}
                                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                    isFromRole
                                      ? "border-blue-300 bg-blue-50 opacity-60 cursor-not-allowed"
                                      : isChecked
                                      ? "border-purple-500 bg-purple-50"
                                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked || isFromRole}
                                    onChange={() => handleTogglePermission(perm.key)}
                                    disabled={isFromRole}
                                    className="mt-1 w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500 disabled:opacity-50"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-800 text-sm flex items-center gap-2">
                                      {perm.label}
                                      {isFromRole && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                          Từ vai trò
                                        </span>
                                      )}
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

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-4">
                <button
                  onClick={handleSaveCustomPermissions}
                  className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  💾 Lưu quyền cá nhân
                </button>
                <button
                  onClick={() => {
                    setCustomPermissions(user.customPermissions || []);
                    setShowPermissionModal(false);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
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

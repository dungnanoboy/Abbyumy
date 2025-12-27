"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AuditLog, AUDIT_LOG_TYPE_LABELS, AUDIT_ACTION_LABELS } from "@/types/audit";

interface AuditLogWithActor extends AuditLog {
  actorName?: string;
  targetName?: string;
  rolledBackByName?: string;
}

export default function AuditLogsPage() {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState<AuditLogWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogWithActor | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filterType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
      });

      if (filterType !== "all") params.append("type", filterType);
      if (filterSearch) params.append("search", filterSearch);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      // Enrich logs with actor/target names
      const enrichedLogs = await enrichLogsWithNames(data.logs);
      setLogs(enrichedLogs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const enrichLogsWithNames = async (logs: AuditLog[]): Promise<AuditLogWithActor[]> => {
    const userIds = new Set<string>();
    logs.forEach((log) => {
      if (log.actorId) userIds.add(log.actorId.toString());
      if (log.targetUserId) userIds.add(log.targetUserId.toString());
      if (log.rolledBackBy) userIds.add(log.rolledBackBy.toString());
    });

    // Fetch user names
    const userMap = new Map<string, string>();
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        data.users.forEach((user: any) => {
          userMap.set(user._id, user.name || user.email);
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }

    return logs.map((log) => ({
      ...log,
      actorName: userMap.get(log.actorId.toString()),
      targetName: log.targetUserId ? userMap.get(log.targetUserId.toString()) : undefined,
      rolledBackByName: log.rolledBackBy ? userMap.get(log.rolledBackBy.toString()) : undefined,
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("vi-VN");
  };

  const viewDetail = (log: AuditLogWithActor) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleRollback = async (logId: string) => {
    if (!currentUser) return;
    if (!confirm("Bạn có chắc muốn khôi phục lại trạng thái trước đó?")) return;

    try {
      const response = await fetch(`/api/admin/audit-logs/${logId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: currentUser._id }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Khôi phục thành công!");
        setShowDetailModal(false);
        fetchLogs();
      } else {
        alert(data.error || "Lỗi khi khôi phục");
      }
    } catch (error) {
      console.error("Error rolling back:", error);
      alert("Lỗi khi khôi phục");
    }
  };

  const canRollback = (log: AuditLog) => {
    if (!log.before) return false;
    if (log.isRolledBack) return false;
    
    // Check if log is within 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const logDate = new Date(log.createdAt);
    
    if (logDate < sevenDaysAgo) return false;

    // Only certain types can be rolled back
    return ["permission_change", "role_change"].includes(log.type);
  };

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Nhật ký hoạt động
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại hoạt động
              </label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                {Object.entries(AUDIT_LOG_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm mô tả
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Nhập từ khóa..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Tìm
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Tổng số: <span className="font-semibold">{total}</span> bản ghi
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người thực hiện
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đối tượng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log._id?.toString()}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => viewDetail(log)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-900">
                            {AUDIT_LOG_TYPE_LABELS[log.type] || log.type}
                          </span>
                          {log.isRolledBack && (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-900">
                              🔄 Đã rollback
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {log.actorName || "Hệ thống"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-900">
                          {AUDIT_ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                        {log.targetName || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewDetail(log);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Trang <span className="font-medium">{currentPage}</span> /{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      ←
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-gray-900">Chi tiết hoạt động</h3>
                {selectedLog.isRolledBack && (
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-900">
                    🔄 Đã rollback
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Rollback Info */}
              {selectedLog.isRolledBack && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Thông tin Rollback</h4>
                  <div className="space-y-1 text-sm text-yellow-800">
                    <div>
                      <span className="font-medium">Được khôi phục bởi:</span>{" "}
                      <span className="font-semibold">{selectedLog.rolledBackByName || "Không rõ"}</span>
                    </div>
                    <div>
                      <span className="font-medium">Thời gian khôi phục:</span>{" "}
                      <span className="font-semibold">{selectedLog.rolledBackAt ? formatDate(selectedLog.rolledBackAt) : "Không rõ"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Thời gian
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Loại hoạt động
                  </label>
                  <p className="mt-1">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-900">
                      {AUDIT_LOG_TYPE_LABELS[selectedLog.type] || selectedLog.type}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Người thực hiện
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {selectedLog.actorName || "Hệ thống"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Hành động
                  </label>
                  <p className="mt-1">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-900">
                      {AUDIT_ACTION_LABELS[selectedLog.action] || selectedLog.action}
                    </span>
                  </p>
                </div>
                {selectedLog.targetName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Đối tượng
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedLog.targetName}
                    </p>
                  </div>
                )}
                {selectedLog.field && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Trường dữ liệu
                    </label>
                    <p className="text-sm text-gray-900 font-mono font-medium">
                      {selectedLog.field}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Mô tả
                </label>
                <p className="text-sm text-gray-900 font-medium leading-relaxed">
                  {selectedLog.description}
                </p>
              </div>

              {/* Before/After */}
              {(selectedLog.before !== undefined || selectedLog.after !== undefined) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.before !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Trước khi thay đổi
                      </label>
                      <pre className="bg-red-50 border border-red-300 rounded-lg p-3 text-xs overflow-x-auto text-gray-900">
                        {JSON.stringify(selectedLog.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.after !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Sau khi thay đổi
                      </label>
                      <pre className="bg-green-50 border border-green-300 rounded-lg p-3 text-xs overflow-x-auto text-gray-900">
                        {JSON.stringify(selectedLog.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Thông tin bổ sung
                  </label>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm space-y-2 text-gray-900">
                    {selectedLog.metadata.ip && (
                      <div>
                        <span className="font-semibold">IP:</span>{" "}
                        <span className="font-mono">{selectedLog.metadata.ip}</span>
                      </div>
                    )}
                    {selectedLog.metadata.userAgent && (
                      <div>
                        <span className="font-semibold">User Agent:</span>{" "}
                        <span className="text-xs">{selectedLog.metadata.userAgent}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                {canRollback(selectedLog) && (
                  <button
                    onClick={() => handleRollback(selectedLog._id!.toString())}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    🔄 Khôi phục
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

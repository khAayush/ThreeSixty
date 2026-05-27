import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UsersIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  KeyIcon,
  CubeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const UsersPage = ({ onLogout }) => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [terminatedUsers, setTerminatedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [reinitializingId, setReinitializingId] = useState(null);
  const [isReinitializeModalOpen, setIsReinitializeModalOpen] = useState(false);
  const [userToReinitialize, setUserToReinitialize] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee",
    password: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const token = localStorage.getItem("token");

  // Current logged-in user (for permission checks)
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();
  const currentRole = currentUser?.role;

  // Helper for handling 401 Unauthorized globally
  const handleUnauthorized = () => {
    toast.error("Session expired. Please log in again.");
    window.location.href = "/login";
  };

  // Permission helpers
  // Admin can only act on employees; manager can act on both admins and employees
  const canTerminate = (targetUser) => {
    if (targetUser.role === "manager") return false;
    if (targetUser.role === "admin") return currentRole === "manager";
    return true; // employee - both admin and manager can terminate
  };

  const canChangePassword = (targetUser) => {
    if (targetUser.isGoogleAccount) return false; // Google password is immutable
    if (targetUser.role === "manager") return false;
    if (targetUser.role === "admin") return currentRole === "manager";
    return true;
  };

  const canEdit = (targetUser) => {
    if (targetUser.role === "manager") return false;
    return true;
  };

  // 1. Fetch Users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      // backend already excludes manager; also filter out pending/rejected here
      const verifiedUsers = data.filter(
        (u) => u.status === "active" || u.status === "terminated",
      );
      setUsers(verifiedUsers);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  // Fetch Pending Users
  const fetchPendingUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/admin/pending-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
    }
  };

  // Approve User
  const handleApprove = async (userId) => {
    try {
      setApprovingId(userId);
      const res = await fetch(`${API_URL}/auth/admin/approve/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to approve user");
      }

      toast.success("User approved successfully");
      setPendingUsers(pendingUsers.filter((u) => u._id !== userId));
    } catch (error) {
      toast.error(error.message || "Failed to approve user");
    } finally {
      setApprovingId(null);
    }
  };

  // Reject User
  const handleReject = async (userId) => {
    try {
      setRejectingId(userId);
      const res = await fetch(`${API_URL}/auth/admin/reject/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to reject user");
      }

      toast.success("User rejected successfully");
      setPendingUsers(pendingUsers.filter((u) => u._id !== userId));
    } catch (error) {
      toast.error(error.message || "Failed to reject user");
    } finally {
      setRejectingId(null);
    }
  };

  // Reinitialize User (set status back to active)
  const handleReinitialize = async (userId) => {
    try {
      setReinitializingId(userId);
      const res = await fetch(`${API_URL}/auth/admin/reinitialize/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to reactivate user");
      }

      toast.success("User reactivated successfully");
      setTerminatedUsers(terminatedUsers.filter((u) => u._id !== userId));
      setIsReinitializeModalOpen(false);
      setUserToReinitialize(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.message || "Failed to reactivate user");
    } finally {
      setReinitializingId(null);
    }
  };

  // 2. Add / Update User
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const loadingToast = toast.loading(
      editingUser ? "Updating user..." : "Adding user...",
    );

    try {
      const isEditing = !!editingUser;
      const targetId = editingUser ? editingUser._id : null;

      const url = isEditing
        ? `${API_URL}/users/${targetId}`
        : `${API_URL}/auth/register`;

      const method = isEditing ? "PUT" : "POST";

      const payload = { ...formData };
      if (isEditing) {
        delete payload.password;
        // If target is a Google user, don't send email (backend will reject it anyway)
        if (editingUser.isGoogleAccount) {
          delete payload.email;
        }
      }

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.dismiss(loadingToast);
        handleUnauthorized();
        return;
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Operation failed");
      }

      const savedUser = responseData.user || responseData;

      if (editingUser) {
        setUsers(
          users.map((u) => ((u._id || u.id) === targetId ? savedUser : u)),
        );
        toast.success("User updated successfully!", { id: loadingToast });
      } else {
        setUsers([savedUser, ...users]);
        toast.success("User added successfully!", { id: loadingToast });
      }

      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(
        error.message ||
          (editingUser ? "Failed to update user." : "Failed to add user."),
        { id: loadingToast },
      );
    }
  };

  // 3. Change Password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const targetId = userToChangePassword._id || userToChangePassword.id;
    const loadingToast = toast.loading("Updating password...");

    try {
      const response = await fetch(`${API_URL}/auth/${targetId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetId,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.status === 401) {
        toast.dismiss(loadingToast);
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update password");

      toast.success("Password updated successfully!", { id: loadingToast });
      closePasswordModal();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  // 4. Delete User
  const confirmDelete = async () => {
    if (!userToDelete) return;

    const isTargetAdmin = userToDelete.role === "admin";
    const totalAdmins = users.filter((u) => u.role === "admin").length;

    if (isTargetAdmin && totalAdmins <= 1) {
      toast.error("Action denied: The system must have at least one Admin.");
      closeDeleteModal();
      return;
    }

    const targetId = userToDelete._id || userToDelete.id;
    const loadingToast = toast.loading("Deleting user...");

    try {
      const response = await fetch(`${API_URL}/auth/${targetId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        toast.dismiss(loadingToast);
        handleUnauthorized();
        closeDeleteModal();
        return;
      }

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to delete");

      setUsers(users.filter((u) => (u._id || u.id) !== targetId));
      toast.success("User terminated successfully!", { id: loadingToast });
      closeDeleteModal();
      fetchUsers();

      if (data.selfDeleted) {
        toast.error("You terminated your own account. Logging out...", {
          icon: "👋",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to terminate user.", {
        id: loadingToast,
      });
    }
  };

  // Modal handlers for reinitialize
  const openReinitializeModal = (user) => {
    setUserToReinitialize(user);
    setIsReinitializeModalOpen(true);
  };

  const closeReinitializeModal = () => {
    setIsReinitializeModalOpen(false);
    setUserToReinitialize(null);
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      });
    } else {
      setEditingUser(null);
      setFormData({ name: "", email: "", role: "employee", password: "" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const openPasswordModal = (user) => {
    setUserToChangePassword(user);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setUserToChangePassword(null);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const [collapsedSections, setCollapsedSections] = useState({ admin: false, employee: false });

  const toggleSection = (role) =>
    setCollapsedSections((prev) => ({ ...prev, [role]: !prev[role] }));

  const matchesSearch = (user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredAdmins = users.filter((u) => u.role === "admin" && matchesSearch(u));
  const filteredEmployees = users.filter((u) => u.role === "employee" && matchesSearch(u));

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const employeeCount = users.filter((u) => u.role === "employee").length;

  return (
    <Layout onLogout={onLogout}>
      <Toaster position="top-right" />
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Users</h2>
            <p className="text-slate-500 text-sm mt-1">
              Manage users in your organization
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add</span>
            </button>
            <div className="relative w-full md:w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            label="Total Users"
            value={isLoading ? "-" : totalUsers}
            icon={UsersIcon}
            iconBg="bg-blue-50"
            iconColor="text-brand"
          />
          <StatCard
            label="Admins"
            value={isLoading ? "-" : adminCount}
            icon={ShieldCheckIcon}
            iconBg="bg-purple-50"
            iconColor="text-purple-500"
          />
          <StatCard
            label="Employees"
            value={isLoading ? "-" : employeeCount}
            icon={UserGroupIcon}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-500"
          />
        </div>

        {/* Users - grouped by role, each section collapsible */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm px-6 py-8 text-center text-sm text-slate-500">
            Loading users...
          </div>
        ) : (
          <div className="space-y-4">
            {[
              { role: "admin",    label: "Admins",    rows: filteredAdmins,    accent: "text-purple-600", dot: "bg-purple-400" },
              { role: "employee", label: "Employees", rows: filteredEmployees, accent: "text-emerald-600", dot: "bg-emerald-400" },
            ].map(({ role, label, rows, accent, dot }) => (
              <div key={role} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Section header / toggle */}
                <button
                  onClick={() => toggleSection(role)}
                  className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/60 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className={`text-sm font-bold ${accent}`}>{label}</span>
                    <span className="text-xs text-slate-400 font-semibold ml-1">({rows.length})</span>
                  </div>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      collapsedSections[role] ? "-rotate-90" : ""
                    }`}
                  />
                </button>

                {/* Collapsible body */}
                {!collapsedSections[role] && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Join Date</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-6 text-center text-sm text-slate-400">
                              No {label.toLowerCase()} found.
                            </td>
                          </tr>
                        ) : (
                          rows.map((user) => (
                            <tr
                              key={user._id || user.id}
                              onClick={() => setSelectedUser(user)}
                              className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  {user.profileImage ? (
                                    <img
                                      src={user.profileImage}
                                      alt={`${user.name}'s profile`}
                                      referrerPolicy="no-referrer"
                                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                      {getInitials(user.name)}
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-sm font-bold text-slate-700">{user.name}</span>
                                    {user.isGoogleAccount && (
                                      <span className="ml-2 text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                                        Google
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.status === "terminated"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {user.createdAt
                                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                      year: "numeric", month: "long", day: "numeric",
                                    })
                                  : user.joinDate}
                              </td>
                              <td className="px-6 py-4">
                                {user.status !== "terminated" ? (
                                  <div className="flex justify-end items-center space-x-2">
                                    {/* Left: change password */}
                                    {canChangePassword(user) && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); openPasswordModal(user); }}
                                        className="bg-brand hover:bg-brand/90 text-white px-3 py-2 rounded-lg hover:brightness-110 shadow-sm transition-all flex items-center"
                                      >
                                        <KeyIcon className="w-3.5 h-3.5 stroke-2" />
                                      </button>
                                    )}
                                    {/* Middle: delete / terminate */}
                                    {canTerminate(user) && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); openDeleteModal(user); }}
                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg hover:brightness-110 shadow-sm transition-all flex items-center"
                                      >
                                        <TrashIcon className="w-3.5 h-3.5 stroke-2" />
                                      </button>
                                    )}
                                    {/* Right: edit info */}
                                    {canEdit(user) && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); openModal(user); }}
                                        className="text-slate-600 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center transition-colors"
                                      >
                                        <PencilIcon className="w-3.5 h-3.5 stroke-2" />
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex justify-end">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); openReinitializeModal(user); }}
                                      disabled={reinitializingId === user._id}
                                      className="text-xs font-bold bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-sm transition-all"
                                    >
                                      {reinitializingId === user._id ? "Reactivating..." : "Reactivate"}
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* --- Pending Users Section --- */}
        {pendingUsers.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
              Pending User Approvals ({pendingUsers.length})
            </h3>
            <div className="grid gap-4">
              {pendingUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white rounded-lg border border-yellow-200 p-4 flex items-center justify-between hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {user.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">
                        {user.name}
                      </h4>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Requested on{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(user._id)}
                      disabled={
                        approvingId === user._id || rejectingId === user._id
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      {approvingId === user._id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(user._id)}
                      disabled={
                        approvingId === user._id || rejectingId === user._id
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      {rejectingId === user._id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ADD / EDIT USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Address
                  {editingUser?.isGoogleAccount && (
                    <span className="ml-2 text-xs font-normal text-blue-500">
                      (Google - read-only)
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!!editingUser?.isGoogleAccount}
                  className={`w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all ${
                    editingUser?.isGoogleAccount
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                  placeholder="jane@techcorp.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  {/* "manager" is intentionally excluded - only seeded, never created via UI */}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
                >
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- CHANGE PASSWORD MODAL --- */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                Change Password
              </h3>
              <button
                onClick={closePasswordModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-2">
                Set a new password for{" "}
                <span className="font-bold text-slate-700">
                  {userToChangePassword?.name}
                </span>
                .
              </p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:brightness-110 shadow-sm transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                Terminate User?
              </h3>
              <p className="text-slate-500 text-sm">
                Are you sure you want to terminate{" "}
                <span className="font-bold text-slate-700">
                  {userToDelete?.name}
                </span>
              </p>
            </div>
            <div className="p-4 bg-slate-50 flex items-center justify-center gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors w-full"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 shadow-sm transition-all w-full"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- User Detail Modal --- */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          token={token}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* --- Reinitialize Confirmation Modal --- */}
      {isReinitializeModalOpen && userToReinitialize && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
                  <ExclamationCircleIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Reactivate Account?
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    This will reactivate {userToReinitialize.name}'s account and
                    send them a reactivation email.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-800">
                <strong>{userToReinitialize.email}</strong> will be able to log
                in again.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeReinitializeModal}
                  disabled={reinitializingId === userToReinitialize._id}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors w-full disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReinitialize(userToReinitialize._id)}
                  disabled={reinitializingId === userToReinitialize._id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm transition-all w-full disabled:opacity-50"
                >
                  {reinitializingId === userToReinitialize._id
                    ? "Reactivating..."
                    : "Yes, Reactivate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// ── User Detail Modal ─────────────────────────────────────────────────────────

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

const UserDetailModal = ({ user, token, onClose }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getInitials = (name) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `${API_URL}/assignments?status=Approved&assignedTo=${user._id || user.id}`,
          {
            credentials: "include",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }
        );
        const data = await res.json();
        if (data.success) setAssignments(data.data);
      } catch {
        // silently fail - not critical
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                {getInitials(user.name)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
                {user.isGoogleAccount && (
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                    Google
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Info grid */}
        <div className="px-6 pt-5 shrink-0">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Role</p>
              <p className="text-sm font-semibold text-slate-700 capitalize">{user.role}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                user.status === "terminated" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Joined</p>
              <p className="text-sm font-semibold text-slate-700">{fmtDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Assigned assets */}
        <div className="px-6 pt-5 pb-6 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Currently Assigned Assets
          </p>
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="w-6 h-6 border-4 border-brand/30 border-t-brand rounded-full animate-spin" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <CubeIcon className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm font-semibold">No assets currently assigned</p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
                      <CubeIcon className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{a.unitId?.name || "-"}</p>
                      <p className="text-xs font-mono text-slate-400">{a.assetId?.tag || "-"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Assigned</p>
                    <p className="text-xs font-semibold text-slate-600">{fmtDate(a.assignedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

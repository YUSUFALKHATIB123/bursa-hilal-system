import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import {
  Users,
  Key,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "owner" | "manager" | "accountant" | "production";
  permissions: string[];
  createdAt: string;
}

const Settings: React.FC = () => {
  const { language } = useLanguage();
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});

  // Load users from AuthContext on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    // Mock user database from AuthContext
    const USERS_DATA: { [email: string]: { password: string; user: any } } = {
      "yusuf@bursahilal.com": {
        password: "admin123",
        user: {
          id: "1",
          name: "Yusuf Alkhatib",
          email: "yusuf@bursahilal.com",
          role: "admin",
          permissions: ["*"],
        },
      },
      "mustafa@bursahilal.com": {
        password: "owner123",
        user: {
          id: "2",
          name: "Mustafa Alkhatib",
          email: "mustafa@bursahilal.com",
          role: "owner",
          permissions: ["*"],
        },
      },
      "mohammad@bursahilal.com": {
        password: "manager123",
        user: {
          id: "3",
          name: "Mohammad Alkhatib",
          email: "mohammad@bursahilal.com",
          role: "manager",
          permissions: ["orders", "inventory", "customers", "reports", "track-order"],
        },
      },
      "accountant@bursahilal.com": {
        password: "account123",
        user: {
          id: "4",
          name: "Qutaiba",
          email: "accountant@bursahilal.com",
          role: "accountant",
          permissions: ["invoices", "financial"],
        },
      },
      "production@bursahilal.com": {
        password: "production123",
        user: {
          id: "5",
          name: "Abu Ibrahim",
          email: "production@bursahilal.com",
          role: "production",
          permissions: ["track-order", "employees"],
        },
      },
    };

    const usersList: User[] = Object.values(USERS_DATA).map((userData, index) => ({
      ...userData.user,
      password: userData.password,
      createdAt: new Date(2024, 0, 15 + index).toISOString().split('T')[0],
    }));

    setUsers(usersList);
    setLoading(false);
  };
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newUser, setNewUser] = useState({
    name: "",
    password: "",
    role: "production" as const,
    email: "",
  });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.password && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        ...newUser,
        permissions: getDefaultPermissions(newUser.role),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers((prev) => [...prev, user]);
      setNewUser({ name: "", password: "", role: "production", email: "" });
      setShowAddUserModal(false);
      showSuccessToast(language === "ar" ? "تم إضافة المستخدم بنجاح" : "User added successfully");
    } else {
      showErrorToast(language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
    }
  };

  const getDefaultPermissions = (role: string): string[] => {
    switch (role) {
      case "admin":
        return ["*"];
      case "owner":
        return ["*"];
      case "manager":
        return ["orders", "inventory", "customers", "reports", "track-order"];
      case "accountant":
        return ["invoices", "financial"];
      case "production":
        return ["track-order", "employees"];
      default:
        return [];
    }
  };

  const handleChangePassword = () => {
    if (passwordChange.newPassword === passwordChange.confirmPassword) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUserId
            ? { ...user, password: passwordChange.newPassword }
            : user,
        ),
      );
      setPasswordChange({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowChangePasswordModal(false);
      setSelectedUserId("");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingUser && editingUser.name && editingUser.email) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? editingUser : user
        )
      );
      setShowEditModal(false);
      setEditingUser(null);
      showSuccessToast(language === "ar" ? "تم تحديث المستخدم بنجاح" : "User updated successfully");
    } else {
      showErrorToast(language === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      showSuccessToast(language === "ar" ? "تم حذف المستخدم بنجاح" : "User deleted successfully");
    }
  };

  // Check if user has settings permission
  if (!hasPermission("settings")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === "ar" ? "غير مصرح بالوصول" : "Access Denied"}
          </h2>
          <p className="text-gray-600 mb-4">
            {language === "ar" 
              ? "ليس لديك صلاحية للوصول إلى صفحة الإعدادات"
              : "You don't have permission to access the settings page."
            }
          </p>
          <p className="text-sm text-gray-500">
            {language === "ar"
              ? "فقط مدير النظام والمالك يمكنهما الوصول إلى هذه الصفحة"
              : "Only system administrators and owners can access this page."
            }
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "ar" ? "إعدادات النظام" : "System Settings"}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === "ar" 
              ? `مرحباً ${user?.name}، يمكنك إدارة المستخدمين هنا`
              : `Welcome ${user?.name}, you can manage users here`
            }
          </p>
        </div>
        <button
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center space-x-2 bg-green-primary text-white px-4 py-2 rounded-lg hover:bg-green-secondary transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "ar" ? "إضافة مستخدم" : "Add User"}</span>
        </button>
      </motion.div>

      {/* Users Management Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-green-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              {language === "ar" ? "إدارة المستخدمين" : "User Management"}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الاسم" : "Name"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الدور" : "Role"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الصلاحيات" : "Permissions"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "تاريخ الإنشاء" : "Created"}
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === "ar" ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 font-mono">
                        {showPasswords[user.id] ? user.password : "••••••••"}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords[user.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "manager"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.includes("*") ? (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          {language === "ar" ? "جميع الصلاحيات" : "All Permissions"}
                        </span>
                      ) : (
                        user.permissions.map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {permission}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title={
                          language === "ar"
                            ? "تعديل المستخدم"
                            : "Edit User"
                        }
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowChangePasswordModal(true);
                        }}
                        className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                        title={
                          language === "ar"
                            ? "تغيير كلمة المرور"
                            : "Change Password"
                        }
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title={
                          language === "ar" ? "حذف المستخدم" : "Delete User"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === "ar" ? "إضافة مستخدم جديد" : "Add New User"}
                </h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    placeholder={
                      language === "ar" ? "أدخل الاسم الكامل" : "Enter full name"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    placeholder={
                      language === "ar"
                        ? "أدخل البريد الإلكتروني"
                        : "Enter email"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "كلمة المرور" : "Password"}
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    placeholder={
                      language === "ar" ? "أدخل كلمة المرور" : "Enter password"
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "الدور" : "Role"}
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="production">
                      {language === "ar" ? "مدير الإنتاج" : "Production"}
                    </option>
                    <option value="accountant">
                      {language === "ar" ? "محاسب" : "Accountant"}
                    </option>
                    <option value="manager">
                      {language === "ar" ? "مدير" : "Manager"}
                    </option>
                    <option value="owner">
                      {language === "ar" ? "المالك" : "Owner"}
                    </option>
                    <option value="admin">
                      {language === "ar" ? "مدير النظام" : "Admin"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-green-primary text-white py-2 rounded-lg hover:bg-green-secondary transition-colors"
                >
                  {language === "ar" ? "إضافة" : "Add User"}
                </button>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === "ar" ? "تعديل المستخدم" : "Edit User"}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "البريد الإلكتروني" : "Email"}
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, email: e.target.value } : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "الدور" : "Role"}
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser((prev) =>
                        prev ? { ...prev, role: e.target.value as any } : null
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  >
                    <option value="production">
                      {language === "ar" ? "مدير الإنتاج" : "Production"}
                    </option>
                    <option value="accountant">
                      {language === "ar" ? "محاسب" : "Accountant"}
                    </option>
                    <option value="manager">
                      {language === "ar" ? "مدير" : "Manager"}
                    </option>
                    <option value="owner">
                      {language === "ar" ? "المالك" : "Owner"}
                    </option>
                    <option value="admin">
                      {language === "ar" ? "مدير النظام" : "Admin"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-green-primary text-white py-2 rounded-lg hover:bg-green-secondary transition-colors"
                >
                  {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && userToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                {language === "ar" 
                  ? `هل أنت متأكد من حذف المستخدم ${userToDelete.name}؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete user ${userToDelete.name}? This action cannot be undone.`
                }
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {language === "ar" ? "حذف" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowChangePasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                </h3>
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar"
                      ? "كلمة المرور الحالية"
                      : "Current Password"}
                  </label>
                  <input
                    type="password"
                    value={passwordChange.currentPassword}
                    onChange={(e) =>
                      setPasswordChange((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                  </label>
                  <input
                    type="password"
                    value={passwordChange.newPassword}
                    onChange={(e) =>
                      setPasswordChange((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === "ar"
                      ? "تأكيد كلمة المرور"
                      : "Confirm Password"}
                  </label>
                  <input
                    type="password"
                    value={passwordChange.confirmPassword}
                    onChange={(e) =>
                      setPasswordChange((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleChangePassword}
                  disabled={
                    passwordChange.newPassword !==
                    passwordChange.confirmPassword
                  }
                  className="flex-1 bg-green-primary text-white py-2 rounded-lg hover:bg-green-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === "ar" ? "تغيير" : "Change"}
                </button>
                <button
                  onClick={() => setShowChangePasswordModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;

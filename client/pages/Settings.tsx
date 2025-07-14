import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
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
} from "lucide-react";

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  email: string;
  createdAt: string;
}

const Settings: React.FC = () => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      username: "yousef",
      password: "admin123",
      role: "admin",
      email: "yousef@bursahilal.com",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      username: "manager",
      password: "manager123",
      role: "manager",
      email: "manager@bursahilal.com",
      createdAt: "2024-01-20",
    },
    {
      id: "3",
      username: "operator",
      password: "operator123",
      role: "operator",
      email: "operator@bursahilal.com",
      createdAt: "2024-02-01",
    },
  ]);

  const [showPasswords, setShowPasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "operator",
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
    if (newUser.username && newUser.password && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        ...newUser,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers((prev) => [...prev, user]);
      setNewUser({ username: "", password: "", role: "operator", email: "" });
      setShowAddUserModal(false);
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

  const handleDeleteUser = (userId: string) => {
    if (
      confirm(
        language === "ar"
          ? "هل أنت متأكد من حذف هذا المستخدم؟"
          : "Are you sure you want to delete this user?",
      )
    ) {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          {language === "ar" ? "إعدادات النظام" : "System Settings"}
        </h1>
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
                  {language === "ar" ? "اسم المستخدم" : "Username"}
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
                      {user.username}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.createdAt}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowChangePasswordModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title={
                          language === "ar"
                            ? "تغيير كلمة المرور"
                            : "Change Password"
                        }
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
                    {language === "ar" ? "اسم المستخدم" : "Username"}
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent"
                    placeholder={
                      language === "ar" ? "أدخل اسم المستخدم" : "Enter username"
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
                    <option value="operator">
                      {language === "ar" ? "مشغل" : "Operator"}
                    </option>
                    <option value="manager">
                      {language === "ar" ? "مدير" : "Manager"}
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

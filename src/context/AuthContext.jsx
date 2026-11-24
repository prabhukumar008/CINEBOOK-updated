import React, { createContext, useContext, useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import {
  getStorageItem,
  initializeDemoData,
  removeStorageItem,
  setStorageItem,
} from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  initializeDemoData();

  const [users, setUsers] = useState(() =>
    getStorageItem(STORAGE_KEYS.USERS, [])
  );
  const [blockedUserIds, setBlockedUserIds] = useState(() =>
    getStorageItem(STORAGE_KEYS.BLOCKED_USERS, [])
  );
  const [currentUser, setCurrentUser] = useState(() =>
    getStorageItem(STORAGE_KEYS.CURRENT_USER, null)
  );

  function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const storedUsers = getStorageItem(STORAGE_KEYS.USERS, users);
    const storedBlocked = getStorageItem(
      STORAGE_KEYS.BLOCKED_USERS,
      blockedUserIds
    );

    const matchedUser = storedUsers.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail &&
        user.password === password
    );

    if (!matchedUser) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (storedBlocked.includes(matchedUser.id)) {
      return {
        success: false,
        message: 'This demo account is currently blocked by the administrator.',
      };
    }

    const safeUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      city: matchedUser.city || 'Mumbai',
    };

    setCurrentUser(safeUser);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, safeUser);

    return { success: true, user: safeUser };
  }

  function register({ name, email, password, city }) {
    const normalizedEmail = email.trim().toLowerCase();
    const storedUsers = getStorageItem(STORAGE_KEYS.USERS, users);

    const alreadyExists = storedUsers.some(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      return {
        success: false,
        message: 'An account with this email already exists.',
      };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'user',
      city: city || 'Mumbai',
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...storedUsers, newUser];
    setUsers(updatedUsers);
    setStorageItem(STORAGE_KEYS.USERS, updatedUsers);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      city: newUser.city,
    };

    setCurrentUser(safeUser);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, safeUser);

    return { success: true, user: safeUser };
  }

  function updateProfile({ name, city }) {
    if (!currentUser) {
      return { success: false, message: 'No active user session.' };
    }

    const updatedUsers = users.map((user) => {
      if (user.id === currentUser.id) {
        return { ...user, name: name.trim(), city };
      }
      return user;
    });

    const updatedCurrentUser = {
      ...currentUser,
      name: name.trim(),
      city,
    };

    setUsers(updatedUsers);
    setCurrentUser(updatedCurrentUser);
    setStorageItem(STORAGE_KEYS.USERS, updatedUsers);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, updatedCurrentUser);

    return { success: true };
  }

  // Admin User Management
  function adminUpdateUser(userId, { name, email }) {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          name: name.trim(),
          email: email.trim().toLowerCase(),
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    setStorageItem(STORAGE_KEYS.USERS, updatedUsers);

    if (currentUser && currentUser.id === userId) {
      const nextCurrent = {
        ...currentUser,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };
      setCurrentUser(nextCurrent);
      setStorageItem(STORAGE_KEYS.CURRENT_USER, nextCurrent);
    }
  }

  function toggleBlockUser(userId) {
    const target = users.find((u) => u.id === userId);
    if (!target || target.email === 'admin@cinebook.com') {
      return { success: false, message: 'Main admin cannot be blocked.' };
    }

    const isBlocked = blockedUserIds.includes(userId);
    const updatedBlocked = isBlocked
      ? blockedUserIds.filter((id) => id !== userId)
      : [...blockedUserIds, userId];

    setBlockedUserIds(updatedBlocked);
    setStorageItem(STORAGE_KEYS.BLOCKED_USERS, updatedBlocked);
    return { success: true };
  }

  function deleteUser(userId) {
    const target = users.find((u) => u.id === userId);
    if (!target || target.email === 'admin@cinebook.com') {
      return {
        success: false,
        message: 'Main administrator account cannot be deleted.',
      };
    }

    const updatedUsers = users.filter((u) => u.id !== userId);
    const updatedBlocked = blockedUserIds.filter((id) => id !== userId);
    setUsers(updatedUsers);
    setBlockedUserIds(updatedBlocked);
    setStorageItem(STORAGE_KEYS.USERS, updatedUsers);
    setStorageItem(STORAGE_KEYS.BLOCKED_USERS, updatedBlocked);
    return { success: true };
  }

  function logout() {
    setCurrentUser(null);
    removeStorageItem(STORAGE_KEYS.CURRENT_USER);
  }

  const isAdmin = Boolean(currentUser && currentUser.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        users,
        blockedUserIds,
        currentUser,
        isAdmin,
        login,
        register,
        updateProfile,
        adminUpdateUser,
        toggleBlockUser,
        deleteUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

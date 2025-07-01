import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { io } from 'socket.io-client';
import urlprovider from '../utils/urlprovider';
import Cookies from 'js-cookie';

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
};

function notificationReducer(state, action) {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: state.unreadCount - 1
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true
        })),
        unreadCount: 0
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket
    const socket = io(urlprovider(), {
      auth: { token }
    });

    // Listen for real-time notifications
    socket.on('notification', (notification) => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    });

    // Fetch existing notifications
    fetchNotifications();

    return () => socket.disconnect();
  }, [token]);

  const fetchNotifications = async () => {
    if (!token) return;

    dispatch({ type: 'SET_LOADING', true });
    try {
      const response = await fetch(`${urlprovider()}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', false });
    }
  };

  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      await fetch(`${urlprovider()}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    try {
      await fetch(`${urlprovider()}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch({ type: 'MARK_ALL_AS_READ' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        ...state,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);

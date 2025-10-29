import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import StatusModal from '../components/ui/StatusModal.jsx';

const NotificationContext = createContext({
  showNotification: () => undefined,
  hideNotification: () => undefined,
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef();

  const hideNotification = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    setNotification(null);
  }, []);

  const showNotification = useCallback(
    ({ type = 'info', title, message, autoClose }) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      setNotification({ type, title, message });

      if (autoClose) {
        timerRef.current = setTimeout(() => {
          hideNotification();
        }, autoClose);
      }
    },
    [hideNotification]
  );

  const value = useMemo(
    () => ({
      showNotification,
      hideNotification,
    }),
    [showNotification, hideNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <StatusModal
        open={Boolean(notification)}
        type={notification?.type}
        title={notification?.title}
        message={notification?.message}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

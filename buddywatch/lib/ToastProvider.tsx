import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from 'react-toastify';

interface ToastProviderProps {
  children: React.ReactNode;
}

/**
 * Provider that wraps the application and provides toast notifications.
 * @param {ToastProviderProps} children The children of the provider
 * @returns The toast provider
 */
export default function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick={true}
        pauseOnHover={true}
        draggable={true}
        theme={'colored'}
        transition={Bounce}
      />
    </>
  );
}

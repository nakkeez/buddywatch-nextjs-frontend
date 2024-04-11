"use client";

import "react-toastify/dist/ReactToastify.css";
import "../app/globals.css";
import { Bounce, ToastContainer } from "react-toastify";

interface ToastProviderProps {
  children: React.ReactNode;
}

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
        theme={"colored"}
        transition={Bounce}
      />
    </>
  );
}

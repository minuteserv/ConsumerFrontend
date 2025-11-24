import { useState, useCallback } from 'react';

let toastId = 0;
const toastListeners = new Set();

export function useToast() {
  const [toasts, setToasts] = useState([]);
  
  const toast = useCallback((options) => {
    const id = ++toastId;
    const toastData = {
      id,
      title: options.title || '',
      description: options.description || '',
      variant: options.variant || 'default',
      duration: options.duration || 3000,
    };
    
    setToasts(prev => [...prev, toastData]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toastData.duration);
    
    return { id };
  }, []);
  
  return { toast, toasts };
}

// Simple toast notification component
export function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  const variantStyles = {
    default: 'bg-gray-900 text-white',
    destructive: 'bg-red-600 text-white',
    success: 'bg-green-600 text-white',
  };
  
  return (
    <div
      className={`${variantStyles[toast.variant] || variantStyles.default} rounded-lg px-4 py-3 shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right`}
    >
      {toast.title && (
        <p className="font-semibold text-sm mb-1">{toast.title}</p>
      )}
      {toast.description && (
        <p className="text-sm opacity-90">{toast.description}</p>
      )}
    </div>
  );
}


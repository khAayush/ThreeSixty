import toast from "react-hot-toast";

/**
 * Show a loading toast and return the toast ID for updating
 */
export const showLoading = (message = "Loading...") => {
  return toast.loading(message);
};

/**
 * Show a success toast
 */
export const showSuccess = (message, toastId = null) => {
  if (toastId) {
    return toast.success(message, { id: toastId });
  }
  return toast.success(message);
};

/**
 * Show an error toast
 */
export const showError = (message, toastId = null) => {
  if (toastId) {
    return toast.error(message, { id: toastId });
  }
  return toast.error(message);
};

/**
 * Show an Pending toast (custom style)
 */
export const showPending = (message, toastId = null) => {
  const pendingStyle = {
    background: "#f0ad4e",
    color: "#fff",
  };

  if (toastId) {
    return toast(message, { id: toastId, style: pendingStyle });
  }
  return toast(message, { style: pendingStyle });
}

/**
 * Update an existing toast
 */
export const updateToast = (toastId, message, type = "success") => {
  toast[type](message, { id: toastId });
};

/**
 * Promise-based toast (auto-handles loading/success/error)
 * Example: toastPromise(fetchData(), "Loading data", "Data loaded!", "Failed to load")
 */
export const toastPromise = (promise, messages) => {
  const { loading, success, error } = messages;

  return toast.promise(
    promise,
    {
      loading,
      success,
      error,
    }
  );
};

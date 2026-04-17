/**
 * Get user data from localStorage
 * @returns {Object|null} User object with name, role, image, etc. or null
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Error parsing user data:", err);
    return null;
  }
};

/**
 * Get user's initials from name
 * @param {string} name - User's full name
 * @returns {string} Initials in uppercase
 */
export const getInitials = (name = "User") => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

/**
 * Get user's profile image or initials
 * @param {Object} user - User object
 * @returns {Object} Object with image URL and initials
 */
export const getUserAvatar = (user) => {
  const image = user?.profileImage || user?.image || null;
  const initials = getInitials(user?.name || "User");

  return {
    image,
    initials,
    hasImage: !!image,
  };
};

/**
 * Get user's display name with fallback
 * @param {Object} user - User object
 * @param {string} fallback - Fallback name
 * @returns {string} User's name
 */
export const getUserName = (user, fallback = "User") => {
  return user?.name || fallback;
};

/**
 * Get user's role with fallback
 * @param {Object} user - User object
 * @param {string} fallback - Fallback role
 * @returns {string} User's role
 */
export const getUserRole = (user, fallback = "Administrator") => {
  return user?.role || fallback;
};

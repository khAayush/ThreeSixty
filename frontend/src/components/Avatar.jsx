import React from "react";

const Avatar = ({ name = "", email = "", photoUrl = "", size = "md" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-xs",
    lg: "w-12 h-12 text-sm",
    xl: "w-16 h-16 text-base",
  };

  const getInitials = () => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return parts[0][0]?.toUpperCase() || "?";
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name || email}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-brand flex items-center justify-center text-white font-bold shrink-0`}
    >
      {getInitials()}
    </div>
  );
};

export default Avatar;

import React from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string; // URL of the avatar image
  alt?: string; // Alt text for the avatar
  size?: "xsmall" | "small" | "medium" | "large" | "xlarge" | "xxlarge"; // Avatar size
  status?: "online" | "offline" | "busy" | "none"; // Status indicator
  fallback?: React.ReactNode;
  fallbackClassName?: string;
}

const sizeClasses = {
  xsmall: "h-6 w-6 max-w-6",
  small: "h-8 w-8 max-w-8",
  medium: "h-10 w-10 max-w-10",
  large: "h-12 w-12 max-w-12",
  xlarge: "h-14 w-14 max-w-14",
  xxlarge: "h-18 w-18 max-w-18",
};

const statusSizeClasses = {
  xsmall: "h-1.5 w-1.5 max-w-1.5",
  small: "h-2 w-2 max-w-2",
  medium: "h-2.5 w-2.5 max-w-2.5",
  large: "h-3 w-3 max-w-3",
  xlarge: "h-3.5 w-3.5 max-w-3.5",
  xxlarge: "h-4 w-4 max-w-4",
};

const statusColorClasses = {
  online: "bg-green-500",
  offline: "bg-red-500",
  busy: "bg-yellow-500",
  none: ""
};

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  size = "medium",
  status = "none",
  fallback,
  fallbackClassName = "bg-gray-200 dark:bg-gray-700 text-gray-400"
}) => {
  return (
    <div className={`relative inline-flex shrink-0 rounded-full ${sizeClasses[size]}`}>
      {/* Avatar Image or Fallback */}
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <div className={`h-full w-full rounded-full flex items-center justify-center overflow-hidden ${fallbackClassName}`}>
          {fallback || <User className="w-[60%] h-[60%]" />}
        </div>
      )}

      {/* Status Indicator */}
      {status !== "none" && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-[1.5px] border-white dark:border-gray-900 ${statusSizeClasses[size]
            } ${statusColorClasses[status] || ""}`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;

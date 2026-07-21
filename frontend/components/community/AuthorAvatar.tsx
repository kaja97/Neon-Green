"use client";

interface AuthorAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

export default function AuthorAvatar({
  name,
  avatarUrl,
  size = "md",
}: AuthorAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const sizeClass = SIZES[size];

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "User"}
        className={`${sizeClass} rounded-full object-cover ring-1 ring-border`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-primary/30 flex items-center justify-center text-primary font-bold`}
    >
      {initials}
    </div>
  );
}

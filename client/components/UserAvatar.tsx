"use client";

import React from "react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  profileImageUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function UserAvatar({
  profileImageUrl,
  name,
  size = "md",
  className = "",
}: UserAvatarProps) {
  // Determinar as dimensões com base no tamanho
  const dimensions = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  // Obter as iniciais do nome (máximo 2 caracteres)
  const getInitials = (name: string): string => {
    if (!name) return "";

    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    } else {
      return (
        parts[0].charAt(0).toUpperCase() +
        parts[parts.length - 1].charAt(0).toUpperCase()
      );
    }
  };

  // Gerar uma cor de fundo baseada no nome (para personalização)
  const getColorClass = (name?: string | null): string => {
    if (!name) return "bg-red-600";

    const colors = [
      "bg-red-600",
      "bg-blue-600",
      "bg-green-600",
      "bg-purple-600",
      "bg-orange-600",
      "bg-teal-600",
    ];

    const index = name.length % colors.length;
    return colors[index];
  };

  const avatarSize = dimensions[size];
  const initials = name ? getInitials(name) : "";
  const colorClass = getColorClass(name);

  return (
    <Avatar className={`${avatarSize} ${className}`}>
      {profileImageUrl ? (
        <AvatarImage src={profileImageUrl} alt="Foto de perfil" />
      ) : null}
      <AvatarFallback
        className={`${colorClass} text-white font-medium flex items-center justify-center`}
      >
        {initials || <User className="h-5 w-5" />}
      </AvatarFallback>
    </Avatar>
  );
}

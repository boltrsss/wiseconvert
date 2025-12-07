"use client";
import React from "react";

interface Props {
  message: string;
  onClose: () => void;
}

export default function ErrorBanner({ message, onClose }: Props) {
  if (!message) return null;

  return (
    <div className="w-full bg-red-500 text-white py-3 px-4 flex justify-between items-center text-sm">
      <span>{message}</span>
      <button onClick={onClose} className="font-bold">✕</button>
    </div>
  );
}
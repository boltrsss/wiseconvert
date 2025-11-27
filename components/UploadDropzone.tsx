
"use client";

import React, { useRef, useState, DragEvent } from "react";

interface UploadDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
}

const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div className="w-full flex justify-center mt-10">
      <div
        className={`w-full max-w-3xl border-2 border-dashed rounded-2xl p-10 text-center transition cursor-pointer bg-white shadow-sm ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
        }`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <span className="text-2xl">⬆️</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Drop files here or <span className="text-blue-600 underline">browse</span>
          </h1>
          <p className="text-sm text-gray-500">
            Supports Video, Audio, Images, Documents &amp; Ebooks • Up to 5 GB (Pro)
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadDropzone;

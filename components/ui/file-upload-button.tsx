"use client";

import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { toast } from "sonner";

interface FileUploadButtonProps {
  onUploadComplete: (url: string, fileName: string, fileType: string) => void;
}

export function FileUploadButton({ onUploadComplete }: FileUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { startUpload } = useUploadThing("fileUploader");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const [res] = await startUpload([file]);
      if (res) {
        onUploadComplete(res.url, file.name, file.type);
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className="relative flex items-center gap-2"
      disabled={isUploading}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept=".pdf,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv"
      />
      <FileUp className="h-5 w-5" />
      {isUploading ? "Uploading..." : "Add File"}
    </Button>
  );
} 
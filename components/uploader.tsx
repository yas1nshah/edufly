"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

type FileItem = {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
};

export function FileUploader() {
  const [files, setFiles] = useState<FileItem[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: uuid(),
      file,
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  const confirmUpload = async ({
    key,
    size,
    name,
    type,
    tags,
  }: {
    key: string;
    size: number;
    name: string;
    type: string;
    tags?: string[];
  }) => {
    await fetch("/api/upload/confirm", {
      method: "POST",
      body: JSON.stringify({ key, size, name, type, tags }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const uploadFile = async (item: FileItem) => {
    const file = item.file;

    // 1. Get signed URL
    const res = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        tags: [], // Optional: add tag selection UI
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Presigned URL fetch failed");

    const { url, key } = await res.json();

    // 2. Upload to R2
    await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    // 3. Confirm upload to DB
    await confirmUpload({
      key,
      size: file.size,
      name: file.name,
      type: file.type,
      tags: [],
    });

    return true;
  };

  const { mutateAsync: uploadAllFiles, isPending } = useMutation({
    mutationFn: async () => {
      for (const item of files) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: "uploading", progress: 10 } : f
          )
        );

        try {
          await uploadFile(item);

          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: "done", progress: 100 }
                : f
            )
          );
        } catch (err: any) {
          console.error(err);
          toast.error(`Failed to upload ${item.file.name}`);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? { ...f, status: "error", progress: 0 }
                : f
            )
          );
        }
      }

      toast.success("All uploads complete!");
    },
  });

  return (
    <Card className="p-6 space-y-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-primary transition"
      >
        <input {...getInputProps()} />
        <p className="text-muted-foreground">Drag & drop files here, or click to select</p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((f) => (
            <div key={f.id}>
              <div className="text-sm font-medium">
                {f.file.name} – {(f.file.size / 1024).toFixed(2)} KB
              </div>
              <Progress value={f.progress} className="h-2" />
            </div>
          ))}

          <Button onClick={() => uploadAllFiles()} disabled={isPending}>
            {isPending ? "Uploading..." : "Upload Files"}
          </Button>
        </div>
      )}
    </Card>
  );
}

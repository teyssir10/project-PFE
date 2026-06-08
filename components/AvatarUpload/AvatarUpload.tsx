"use client";

import React, { useRef, useState } from "react";
import { Spin, App } from "antd";
import { CameraOutlined } from "@ant-design/icons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import Image from "next/image";

interface AvatarUploadProps {
  currentUrl?: string | null;
  size?: number;
  onUploadSuccess?: (url: string) => void;
}

export default function AvatarUpload({
  currentUrl,
  size = 100,
  onUploadSuccess,
}: AvatarUploadProps) {
  const { message } = App.useApp();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      message.error("Only JPG, PNG, WEBP or GIF images are allowed.");
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split(".").pop();

      const filePath = `${user.id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      // Met à jour les métadonnées auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      setPreviewUrl(publicUrl);
      onUploadSuccess?.(publicUrl);
      message.success("Profile picture updated!");
    } catch (err: any) {
      console.error(err);
      message.error(err?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div
      className="relative cursor-pointer group"
      style={{ width: size, height: size }}
      onClick={handleClick}
      title="Click to change profile picture"
    >
      {/* Avatar */}
      <div
        className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg"
        style={{ width: size, height: size }}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile picture"
            width={size}
            height={size}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <Image
            src="/panda-logo.png"
            alt="Default panda avatar"
            width={size}
            height={size}
            className="object-cover w-full h-full"
          />
        )}
      </div>

      {/* Online dot */}
      <div
        className="absolute bg-green-400 rounded-full border-2 border-white dark:border-slate-800"
        style={{
          width:  size * 0.18,
          height: size * 0.18,
          bottom: size * 0.04,
          right:  size * 0.04,
        }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
        {uploading ? (
          <Spin size="small" className="[&_.ant-spin-dot-item]:!bg-white" />
        ) : (
          <>
            <CameraOutlined className="text-white text-lg" />
            <span className="text-white text-[10px] font-medium leading-tight text-center px-1">
              Change photo
            </span>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
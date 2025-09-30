"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";

type AvatarInputProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  fallback?: string; // ex: iniciais do usuário
};

export function AvatarInput({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  value,
  onChange,
  fallback = "?",
}: AvatarInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Label>Foto do Idoso</Label>

      <Avatar className="w-24 h-24 border-2 border-healthcare-light">
        {preview ? (
          <AvatarImage src={preview} alt="Avatar preview" />
        ) : (
          <AvatarFallback>
            <User className="w-6 h-6" />
            {fallback}
          </AvatarFallback>
        )}
      </Avatar>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={triggerFileSelect}
      >
        <Camera className="w-4 h-4 mr-2" />
        Alterar Foto
      </Button>
    </div>
  );
}

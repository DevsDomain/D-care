import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";

type AvatarInputProps = {
  value: File | null;
  label?: string;
  defaultUrl?: string;   // 👈 new prop
  onChange: (file: File | null) => void;
};

export function AvatarInput({ value, label, defaultUrl, onChange }: AvatarInputProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // create preview when a file is selected
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const imageSrc = preview || defaultUrl || null;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImagePlus className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => onChange(e.target.files?.[0] || null)}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange(null)}
            >
              <X className="w-4 h-4 mr-1" /> Remover
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ id, value, onChange, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative" dir="ltr">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="h-11 pe-9"
        {...props}
      />
      <button
        type="button"
        aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
        onClick={() => setShowPassword((v) => !v)}
        className="absolute top-1/2 -translate-y-1/2 end-2 min-w-8 min-h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
      >
        {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
      </button>
    </div>
  );
};
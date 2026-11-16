import React from "react";

export function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  reveal = false,
  className,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "password";
  placeholder?: string;
  reveal?: boolean;
  className?: string;
}) {
  const [shown, setShown] = React.useState(false);
  return (
    <div className="relative w-full">
      <input
        type={reveal && !shown ? "text" : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
      {reveal && (
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs"
        >
          {shown ? "Sembunyikan" : "Tampilkan"}
        </button>
      )}
    </div>
  );
}

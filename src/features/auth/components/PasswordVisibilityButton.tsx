import { Eye, EyeOff } from "lucide-react";

type PasswordVisibilityButtonProps = {
  inputId: string;
  visible: boolean;
  onToggle: () => void;
};

export default function PasswordVisibilityButton({
  inputId,
  visible,
  onToggle,
}: PasswordVisibilityButtonProps) {
  return (
    <button
      aria-controls={inputId}
      aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      aria-pressed={visible}
      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#777b74] transition hover:bg-[#f3eee6] hover:text-[#20352a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8baf3f]/50"
      onClick={onToggle}
      type="button"
    >
      {visible ? <EyeOff aria-hidden="true" size={19} /> : <Eye aria-hidden="true" size={19} />}
    </button>
  );
}

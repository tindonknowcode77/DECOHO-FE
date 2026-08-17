"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { googleClientId } from "@/src/configs/auth";
import { saveAuthTokens, saveSessionUser } from "../services/session";

type GoogleCredentialResponse = {
  clientId?: string;
  credential?: string;
  select_by?: string;
};

type GoogleButtonConfiguration = {
  logo_alignment?: "left" | "center";
  shape?: "rectangular" | "pill" | "circle" | "square";
  size?: "small" | "medium" | "large";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  theme?: "outline" | "filled_blue" | "filled_black";
  type?: "standard" | "icon";
  width?: number;
};

type GoogleAccountId = {
  cancel: () => void;
  initialize: (configuration: {
    callback: (response: GoogleCredentialResponse) => void;
    cancel_on_tap_outside?: boolean;
    client_id: string;
    context?: "signin" | "signup" | "use";
    ux_mode?: "popup" | "redirect";
  }) => void;
  renderButton: (
    parent: HTMLElement,
    configuration: GoogleButtonConfiguration,
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountId;
      };
    };
  }
}

type GoogleProfileResponse = {
  accessToken?: string;
  refreshToken?: string;
  message?: string | string[];
  user?: {
    avatar?: string | { secureUrl?: string };
    email?: string;
    fullName?: string;
    role?: string;
    onboardingCompleted?: boolean;
  };
};

type GoogleSignInButtonProps = {
  onError: (message: string) => void;
  remember: boolean;
};

let initializedGoogleClientId: string | null = null;
let activeCredentialHandler: ((response: GoogleCredentialResponse) => void) | null = null;

export default function GoogleSignInButton({
  onError,
  remember,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const buttonContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const clientId = googleClientId;

  const handleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        onError("Google không trả về thông tin đăng nhập. Vui lòng thử lại.");
        return;
      }

      setIsVerifying(true);
      onError("");

      try {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(/\/$/, "");
        const verificationResponse = await fetch(`${baseUrl}/auth/google`, {
          body: JSON.stringify({ credential: response.credential }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
        const profile =
          (await verificationResponse.json()) as GoogleProfileResponse;

        if (
          !verificationResponse.ok ||
          !profile.accessToken ||
          !profile.user?.email ||
          !profile.user?.fullName
        ) {
          throw new Error(
            (Array.isArray(profile.message) ? profile.message.join(". ") : profile.message) ||
              "Không thể xác minh tài khoản Google. Vui lòng thử lại.",
          );
        }

        const apiRole = String(profile.user.role ?? "USER").toLowerCase();
        const role = apiRole === "customer" ? "user" : apiRole === "store" ? "supplier" : (["user", "supplier", "staff", "admin", "super_admin"].includes(apiRole) ? apiRole : "user") as "user" | "supplier" | "staff" | "admin" | "super_admin";
        const avatar = typeof profile.user.avatar === "string" ? profile.user.avatar : profile.user.avatar?.secureUrl;
        saveAuthTokens(profile.accessToken, profile.refreshToken);
        saveSessionUser({
          avatar,
          email: profile.user.email,
          name: profile.user.fullName,
          registeredAt: new Date().toISOString(),
          remember,
          role,
          onboardingCompleted: Boolean(profile.user.onboardingCompleted),
        });
        router.replace(["admin", "super_admin", "staff"].includes(role) ? "/admin" : role === "supplier" ? "/store" : profile.user.onboardingCompleted ? "/" : "/onboarding");
        router.refresh();
      } catch (error) {
        setIsVerifying(false);
        onError(
          error instanceof Error
            ? error.message
            : "Đăng nhập Google không thành công.",
        );
      }
    },
    [onError, remember, router],
  );

  useEffect(() => {
    activeCredentialHandler = handleCredential;
    return () => {
      if (activeCredentialHandler === handleCredential) {
        activeCredentialHandler = null;
      }
    };
  }, [handleCredential]);

  useEffect(() => {
    const container = buttonContainerRef.current;
    const googleIdentity = window.google?.accounts.id;

    if (!isScriptReady || !container) {
      return;
    }

    if (!clientId) {
      onError(
        "Thiếu NEXT_PUBLIC_GOOGLE_CLIENT_ID trong cấu hình môi trường.",
      );
      return;
    }

    const buttonContainer = container;

    if (!googleIdentity) {
      onError("Không thể khởi tạo dịch vụ đăng nhập Google.");
      return;
    }

    const identityService = googleIdentity;

    if (initializedGoogleClientId !== clientId) {
      identityService.initialize({
        callback: (response) => activeCredentialHandler?.(response),
        cancel_on_tap_outside: true,
        client_id: clientId,
        context: "signin",
        ux_mode: "popup",
      });
      initializedGoogleClientId = clientId;
    }

    let renderedWidth = 0;

    function renderButton() {
      const availableWidth = Math.floor(
        buttonContainer.getBoundingClientRect().width,
      );

      if (availableWidth < 200) {
        return;
      }

      const width = Math.min(availableWidth, 400);

      if (width === renderedWidth && buttonContainer.childElementCount > 0) {
        return;
      }

      renderedWidth = width;
      buttonContainer.replaceChildren();
      identityService.renderButton(buttonContainer, {
        logo_alignment: "left",
        shape: "rectangular",
        size: "large",
        text: "signin_with",
        theme: "outline",
        type: "standard",
        width,
      });
    }

    renderButton();
    const resizeObserver = new ResizeObserver(renderButton);
    resizeObserver.observe(buttonContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [clientId, handleCredential, isScriptReady, onError]);

  return (
    <>
      <Script
        onError={() =>
          onError(
            "Không tải được dịch vụ đăng nhập Google. Hãy kiểm tra kết nối mạng.",
          )
        }
        onReady={() => setIsScriptReady(true)}
        src="https://accounts.google.com/gsi/client?hl=vi"
        strategy="afterInteractive"
      />
      <div className="relative min-h-11 w-full">
        <div
          className="flex min-h-11 w-full items-center justify-center"
          ref={buttonContainerRef}
        />
        {(!isScriptReady || isVerifying) && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-[#ded6c9] bg-white text-sm font-bold text-[#51564f]">
            <LoaderCircle className="h-4 w-4 animate-spin text-[#2f6f5e]" />
            {isVerifying ? "Đang xác minh Google..." : "Đang tải Google..."}
          </div>
        )}
      </div>
    </>
  );
}

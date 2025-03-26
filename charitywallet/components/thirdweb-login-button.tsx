"use client";

import { useLogin } from "@/hooks/use-thirdweb-headless-login";

export default function LoginButton() {
  const { login, account } = useLogin();

  return (
    <button type="button" onClick={login}>
      {account ? "Logout" : "Login"}
    </button>
  );
}

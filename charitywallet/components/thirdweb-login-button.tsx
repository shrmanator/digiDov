"use client";

import { useLogin } from "@/hooks/use-thidweb-headless-login";

export default function LoginButton() {
  const { login, account } = useLogin();

  return <button onClick={login}>{account ? "Logout" : "Login"}</button>;
}

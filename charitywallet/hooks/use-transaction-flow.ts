import { useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { PreparedTransaction } from "thirdweb";
import { sendOtp, verifyOtp } from "@/utils/send-or-verify-otp";
import { buildPreparedTransaction } from "@/utils/build-prepared-transaction";

export function useTransactionFlow(emailForOtp: string) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const activeAccount = useActiveAccount();
  const { mutate: sendTx, data, isPending, isSuccess } = useSendTransaction();

  const [pendingTx, setPendingTx] = useState<PreparedTransaction | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [methodId, setMethodId] = useState("");
  const [otpError, setOtpError] = useState("");

  const submitForm = (formData: FieldValues) => {
    if (!activeAccount) return;

    const tx = buildPreparedTransaction(
      formData.recipientAddress,
      formData.amount
    );
    setPendingTx(tx);

    if (!emailForOtp) {
      setOtpError("No email for OTP.");
      return;
    }

    sendOtp(emailForOtp)
      .then((res) => {
        if (res.email_id) {
          setMethodId(res.email_id);
          setIsOtpModalOpen(true);
        } else {
          setOtpError(res.error_message ?? "Failed to send OTP.");
        }
      })
      .catch(() => setOtpError("Unable to send OTP, please try again later."));
  };

  const handleOtpVerified = async (code: string) => {
    try {
      const result = await verifyOtp(methodId, code);

      if (result.status_code !== 200) {
        /* cast so TS sees error_message */
        const errmsg =
          (result.response as { error_message?: string })?.error_message ??
          "OTP verification failed.";
        throw new Error(errmsg);
      }

      setIsOtpModalOpen(false);

      if (pendingTx) {
        sendTx(pendingTx, { onSuccess: () => reset() });
        setPendingTx(null);
      }
    } catch (err: any) {
      throw err;
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    setValue,
    submitForm,
    handleOtpVerified,
    isPending,
    isSuccess,
    data,
    otpError,
    isOtpModalOpen,
    setIsOtpModalOpen,
  };
}

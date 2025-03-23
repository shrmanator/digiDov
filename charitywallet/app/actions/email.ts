"use server";

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { donation_receipt, donor, charity } from "@prisma/client";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export async function sendContactEmailAction(formData: FormData) {
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const emailParams = new EmailParams()
    .setFrom(new Sender("contact@digidov.com", "Dov"))
    .setTo([new Recipient(to)])
    .setSubject(subject)
    .setHtml(`<p>${message}</p>`);

  try {
    await mailerSend.email.send(emailParams);
    return { success: true };
  } catch (err) {
    console.error("Failed to send contact email", err);
    return { success: false, error: "Failed to send contact email" };
  }
}

export async function sendDonationReceiptAction(
  receipt: donation_receipt & {
    donor: donor;
    charity: charity;
  }
) {
  try {
    const donorEmail = receipt.donor?.email;
    if (!donorEmail) {
      throw new Error("Donor email is required");
    }
    const donorName =
      `${receipt.donor?.first_name || ""} ${
        receipt.donor?.last_name || ""
      }`.trim() || "Donor";
    const receiptNumber = receipt.receipt_number || "unknown";

    const charityName =
      receipt.charity?.charity_name || "your supported charity";

    const emailParams = new EmailParams()
      .setFrom(new Sender("contact@digidov.com", "Digidov"))
      .setTo([new Recipient(donorEmail, donorName)])
      .setSubject("Your Donation Receipt")
      .setHtml(
        `<p>Dear ${donorName},</p>
         <p>Thank you for your donation to <strong>${charityName}</strong>. Your receipt is attached below.</p>
         <p>Receipt Number: <strong>${receiptNumber}</strong></p>
         <p>Warm regards,</p>
         <p>Digidov</p>`
      );

    await mailerSend.email.send(emailParams);
    console.log(`✅ Receipt email sent to ${donorEmail}`);
    return { success: true };
  } catch (err) {
    console.error("❌ Failed to send donation receipt", err);
    return { success: false, error: "Failed to send donation receipt" };
  }
}

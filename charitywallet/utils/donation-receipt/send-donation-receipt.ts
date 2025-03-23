// lib/email/sendDonationReceipt.ts
import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
  Attachment,
} from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

/**
 * Sends a donation receipt email with a dynamically generated PDF attachment.
 */
export async function sendDonationReceiptFromBuffer(
  donorEmail: string,
  donorName: string,
  pdfBuffer: Uint8Array,
  receiptNumber: string
) {
  const sentFrom = new Sender("your@email.com", "Your Charity Name");
  const recipients = [new Recipient(donorEmail, donorName)];

  const attachments = [
    new Attachment(
      Buffer.from(pdfBuffer).toString("base64"),
      `receipt-${receiptNumber}.pdf`,
      "attachment"
    ),
  ];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Your Donation Receipt")
    .setHtml(
      `<p>Dear ${donorName},</p>
       <p>Thank you for your generous donation. Please find your receipt attached.</p>
       <p>Receipt Number: <strong>${receiptNumber}</strong></p>
       <p>Best regards,</p>
       <p>Your Charity Team</p>`
    )
    .setAttachments(attachments);

  await mailerSend.email.send(emailParams);
}

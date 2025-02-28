import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
  Attachment,
} from "mailersend";
import fs from "fs";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

/**
 * Sends a donation receipt email to the donor.
 * @param donorEmail - The email address of the donor.
 * @param donorName - The name of the donor.
 * @param receiptPath - The file path of the receipt PDF.
 * @param receiptNumber - The receipt number.
 */
export async function sendDonationReceipt(
  donorEmail: string,
  donorName: string,
  receiptPath: string,
  receiptNumber: string
) {
  const sentFrom = new Sender("your@email.com", "Your Charity Name");
  const recipients = [new Recipient(donorEmail, donorName)];

  // Read and encode the PDF file
  const pdfContent = fs.readFileSync(receiptPath, { encoding: "base64" });
  const attachments = [
    new Attachment(pdfContent, `receipt-${receiptNumber}.pdf`, "attachment"),
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

  try {
    await mailerSend.email.send(emailParams);
    console.log(`Receipt sent successfully to ${donorEmail}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

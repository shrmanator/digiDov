"use server";

import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
  Attachment,
} from "mailersend";
import { charity, donation_receipt, donor } from "@prisma/client";
import { generateDonationReceiptPDF } from "@/utils/generate-donation-receipt";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

// ✅ Contact email action
export async function sendContactEmailAction(formData: FormData) {
  const to = formData.get("to") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const emailParams = new EmailParams()
    .setFrom(new Sender("contact@digidov.com", "digiDov Contact"))
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

// ✅ Donor receipt email with attachment
export async function notifyDonorOfDonation(
  receipt: donation_receipt & {
    donor?: donor;
    charity?: charity;
  }
) {
  try {
    const pdfBytes = await generateDonationReceiptPDF(receipt);
    const base64PDF = Buffer.from(pdfBytes).toString("base64");
    const donorEmail = receipt.donor?.email || "";
    const donorName =
      `${receipt.donor?.first_name || ""} ${
        receipt.donor?.last_name || ""
      }`.trim() || "Donor";
    const charityName =
      receipt.charity?.charity_name || "your supported charity";
    const receiptNumber = receipt.receipt_number || "unknown";
    const transactionHash = receipt.transaction_hash || "";
    const txLink = transactionHash
      ? `<a href="https://www.blockscan.com/tx/${transactionHash}" target="_blank" rel="noopener noreferrer">${transactionHash}</a>`
      : "N/A";
    const charitySlug = receipt.charity?.slug || "your-charity";
    // Shortened link for viewing all receipts
    const shortReceiptLink = `https://digidov.com/donate/${charitySlug}`;

    const emailParams = new EmailParams()
      .setFrom(new Sender("contact@digidov.com", "digiDov Receipts"))
      .setTo([new Recipient(donorEmail, donorName)])
      .setSubject("Your Donation Receipt")
      .setHtml(
        `<p>Dear ${donorName},</p>
         <p>Thank you for your donation to <strong>${charityName}</strong>.</p>
         <p>Your receipt is attached below. Alternatively, you can view all your receipts at: 
           <a href="${shortReceiptLink}" target="_blank" rel="noopener noreferrer">${shortReceiptLink}</a>
         </p>
         <p><strong>Receipt Number:</strong> ${receiptNumber}</p>
         <p><strong>Transaction hash:</strong> ${txLink}</p>
         <p>Warm regards,</p>
         <p>digiDov</p>`
      )
      .setAttachments([
        new Attachment(
          base64PDF,
          `digidov-receipt-${receiptNumber}.pdf`,
          "attachment"
        ),
      ]);

    await mailerSend.email.send(emailParams);
    console.log(`✅ Receipt email sent to ${donorEmail}`);
    return { success: true };
  } catch (err) {
    console.error("❌ Failed to send donation receipt", err);
    return { success: false, error: "Failed to send donation receipt" };
  }
}

// ✅ Notify charity of donation (no attachment)
export async function notifyCharityOfDonation(
  receipt: donation_receipt & {
    donor?: donor;
    charity?: charity;
  }
) {
  try {
    const donorName =
      `${receipt.donor?.first_name || ""} ${
        receipt.donor?.last_name || ""
      }`.trim() || "Anonymous Donor";
    const donorEmail = receipt.donor?.email || "Unknown email";
    const amount = `$${receipt.fiat_amount?.toFixed(2) || "0.00"} CAD`;
    const charityName = receipt.charity?.charity_name || "Your Charity";
    const charityEmail = receipt.charity?.contact_email;
    const transactionHash = receipt.transaction_hash || "";
    const txLink = transactionHash
      ? `<a href="https://www.blockscan.com/tx/${transactionHash}" target="_blank" rel="noopener noreferrer">${transactionHash}</a>`
      : "N/A";

    if (!charityEmail) {
      console.warn(`❌ Charity email not provided for ${charityName}`);
      return { success: false, error: "Charity email not found." };
    }

    const emailParams = new EmailParams()
      .setFrom(new Sender("contact@digidov.com", "digiDov Alerts"))
      .setTo([new Recipient(charityEmail, charityName)])
      .setSubject("New Donation Received")
      .setHtml(
        `<p>Hello ${charityName},</p>
         <p>You’ve just received a new donation:</p>
         <ul>
           <li><strong>Donor:</strong> ${donorName}</li>
           <li><strong>Email:</strong> ${donorEmail}</li>
           <li><strong>Amount:</strong> ${amount}</li>
           <li><strong>Transaction hash:</strong> ${txLink}</li>
         </ul>
         <p>You can view this donation and its official receipt in your dashboard:</p>
         <p><a href="https://www.digidov.com/dashboard/audits">Go to dashboard</a></p>
         <p>– digiDov</p>`
      );

    await mailerSend.email.send(emailParams);
    console.log(`📧 Charity notification sent to ${charityEmail}`);
    return { success: true };
  } catch (err) {
    console.error("❌ Failed to notify charity", err);
    return { success: false, error: "Failed to notify charity of donation" };
  }
}

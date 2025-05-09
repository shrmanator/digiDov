import {
  MailerSend,
  EmailParams,
  Sender,
  Recipient,
  Attachment,
} from "mailersend";
import { generateDonationReceiptPDF } from "@/utils/generate-donation-receipt";
import { receiptsToCsv } from "@/utils/convert-receipt-to-csv";

// Front-end receipt DTO
import type {
  donation_receipt as PrismaDonationReceipt,
  donor as PrismaDonor,
  charity as PrismaCharity,
} from "@prisma/client";
import { DonationReceipt } from "../types/receipt";

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
  } catch (error: unknown) {
    console.error("Failed to send contact email", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ✅ Notify charity of donation (no attachment)
export async function notifyCharityAboutDonation(
  receipt: PrismaDonationReceipt & {
    donor?: PrismaDonor;
    charity?: PrismaCharity;
  }
) {
  try {
    const donorName =
      `${receipt.donor?.first_name || ""} ${
        receipt.donor?.last_name || ""
      }`.trim() || "Anonymous Donor";
    const donorEmail = receipt.donor?.email || "Unknown email";
    const amount = `$${receipt.fiat_amount.toFixed(2)} CAD`;
    const charityName = receipt.charity?.charity_name || "Your Charity";
    const charityEmail = receipt.charity?.contact_email;
    const transactionHash = receipt.transaction_hash;
    const txLink = transactionHash
      ? `<a href=\"https://www.blockscan.com/tx/${transactionHash}\" target=\"_blank\" rel=\"noopener noreferrer\">${transactionHash}</a>`
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
         <p><a href=\"https://www.digidov.com/dashboard/audits\">Go to dashboard</a></p>
         <p>– digiDov</p>`
      );

    await mailerSend.email.send(emailParams);
    console.log(`📧 Charity notification sent to ${charityEmail}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("❌ Failed to notify charity", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ✅ Donor receipt email with attachment
export async function notifyDonorWithReceipt(
  receipt: PrismaDonationReceipt & {
    donor?: PrismaDonor;
    charity?: PrismaCharity;
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
    const receiptNumber = receipt.receipt_number;
    const transactionHash = receipt.transaction_hash;
    const txLink = transactionHash
      ? `<a href=\"https://www.blockscan.com/tx/${transactionHash}\" target=\"_blank\" rel=\"noopener noreferrer\">${transactionHash}</a>`
      : "N/A";
    const charitySlug = receipt.charity?.slug || "your-charity";
    const shortReceiptLink = `https://digidov.com/donate/${charitySlug}`;

    const emailParams = new EmailParams()
      .setFrom(new Sender("contact@digidov.com", "digiDov Receipts"))
      .setTo([new Recipient(donorEmail, donorName)])
      .setSubject("Your Donation Receipt")
      .setHtml(
        `<p>Dear ${donorName},</p>
         <p>Thank you for your donation to <strong>${charityName}</strong>.</p>
         <p>Your receipt is attached below. Alternatively, you can view all your receipts at: 
           <a href=\"${shortReceiptLink}\" target=\"_blank\" rel=\"noopener noreferrer\">${shortReceiptLink}</a>
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
  } catch (error: unknown) {
    console.error("❌ Failed to send donation receipt", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// 🔧 Manual donor notification (no PDF attachment)
export async function notifyDonorWithoutReceipt(
  receipt: PrismaDonationReceipt & {
    donor?: PrismaDonor;
    charity?: PrismaCharity;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const donorEmail = receipt.donor?.email || "";
    const donorName =
      `${receipt.donor?.first_name || ""} ${
        receipt.donor?.last_name || ""
      }`.trim() || "Donor";
    const charityName =
      receipt.charity?.charity_name || "the charity you supported";
    const charitySlug = receipt.charity?.slug || "";
    const shortReceiptLink = `https://digidov.com/donate/${charitySlug}`;

    const emailParams = new EmailParams()
      .setFrom(new Sender("contact@digidov.com", "digiDov Receipts"))
      .setTo([new Recipient(donorEmail, donorName)])
      .setSubject("Thank You for Your Donation")
      .setHtml(
        `<p>Dear ${donorName},</p>
         <p>Thank you for your donation to <strong>${charityName}</strong>. Your official tax receipt will be sent to you directly by ${charityName}</p>
         <p>You can view your donation details here: <a href=\"${shortReceiptLink}\" target=\"_blank\" rel=\"noopener noreferrer\">${shortReceiptLink}</a></p>
         <p>Warm regards,</p>
         <p>digiDov x ${charityName}</p>`
      );

    await mailerSend.email.send(emailParams);
    console.log(`✅ Manual receipt notification sent to ${donorEmail}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("❌ Failed to send manual donation notification", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: `Failed to send manual donation notification: ${message}`,
    };
  }
}

// ✅ Email CSV of receipts to charity
export async function notifyCharityWithCsv(
  receipts: DonationReceipt[],
  charityEmail: string,
  charityName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const csv = receiptsToCsv(receipts);
    const base64Csv = Buffer.from(csv).toString("base64");

    const emailParams = new EmailParams()
      .setFrom(new Sender("contact@digidov.com", "digiDov Notifications"))
      .setTo([new Recipient(charityEmail, charityName ?? "")])
      .setSubject(`Donation Report: ${charityName ?? "Charity"}`)
      .setHtml(
        `<p>Hello ${charityName ?? "Charity"},</p>
         <p>Please find attached a CSV containing the donation details.</p>`
      )
      .setAttachments([
        new Attachment(
          base64Csv,
          "charity-donations.csv",
          "attachment",
          "text/csv"
        ),
      ]);

    await mailerSend.email.send(emailParams);
    console.log(`✅ CSV emailed to charity at ${charityEmail}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("MailerSend CSV error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: `Failed to send CSV email: ${message}` };
  }
}

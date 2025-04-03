import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse and log the incoming request body
    const body = await req.json();
    console.log("Received request body:", body);

    const { email, name, nonprofits_name } = body;

    // Validate required fields
    if (!email || !name || !nonprofits_name) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!name) missingFields.push("name");
      if (!nonprofits_name) missingFields.push("nonprofits_name");
      const errorMessage = `Missing required fields: ${missingFields.join(
        ", "
      )}`;
      console.error(errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Construct the payload for MailerSend and log it
    const payload = {
      from: {
        email: "contact@digidov.com",
        name: "digiDov",
      },
      to: [
        {
          email,
          name,
        },
      ],
      subject: "Unlock a New Donor Base with digiDov",
      template_id: "pxkjn411zk64z781",
      personalization: [
        {
          email,
          data: {
            nonprofits_name,
          },
        },
      ],
    };

    console.log("Payload for MailerSend:", payload);

    // Send the email via MailerSend API
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Attempt to parse the response JSON, but handle empty responses gracefully
    let result = {};
    try {
      result = await res.json();
    } catch (jsonError) {
      console.warn("No JSON response from MailerSend, reading raw text");
      const textResult = await res.text();
      console.warn("Raw response text:", textResult);
      result = { raw: textResult };
    }

    console.log("MailerSend API response:", result);

    // If MailerSend returns an error, log and return the error details
    if (!res.ok) {
      console.error("MailerSend API error:", result);
      return NextResponse.json({ error: result }, { status: res.status });
    }

    console.log("Email sent successfully.");
    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err: any) {
    console.error("Error in POST /api/send-email:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

import BookingCancelled from "$lib/emails/booking-cancelled";
import BookingConfirmed from "$lib/emails/booking-confirmed";
import BookingRequest from "$lib/emails/booking-request";
import mjml2html from "mjml";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type LocationData = {
  name: string;
  address: string;
};

type CancellationEmailData = {
  eventTitle: string;
  hostName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  guestName: string;
  cancellationMessage: string;
  rebookUrl: string;
};

type ConfirmationEmailData = {
  eventTitle: string;
  hostName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  guestName: string;
  location: LocationData;
};

type RequestEmailData = {
  eventTitle: string;
  hostName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  guestName: string;
  location: LocationData;
};

async function sendCancellationEmail(to: string, data: CancellationEmailData) {
  try {
    let mjmlTemplate = BookingCancelled;

    mjmlTemplate = mjmlTemplate.replace(/{{eventTitle}}/g, data.eventTitle);
    mjmlTemplate = mjmlTemplate.replace(/{{hostName}}/g, data.hostName);
    mjmlTemplate = mjmlTemplate.replace(/{{bookingDate}}/g, data.bookingDate);
    mjmlTemplate = mjmlTemplate.replace(/{{startTime}}/g, data.startTime);
    mjmlTemplate = mjmlTemplate.replace(/{{endTime}}/g, data.endTime);
    mjmlTemplate = mjmlTemplate.replace(/{{timeZone}}/g, data.timeZone);
    mjmlTemplate = mjmlTemplate.replace(/{{guestName}}/g, data.guestName);
    mjmlTemplate = mjmlTemplate.replace(/{{cancellationMessage}}/g, data.cancellationMessage || "");
    mjmlTemplate = mjmlTemplate.replace(/{{rebookUrl}}/g, data.rebookUrl);

    const { html, errors } = mjml2html(mjmlTemplate);

    if (errors.length) {
      console.error("MJML errors:", errors);
      return;
    }

    await resend.emails.send({
      from: "D2B <onboarding@resend.dev>",
      to: [to],
      subject: "Booking Cancelled | D2B",
      html: html
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

async function sendConfirmationEmail(to: string, data: ConfirmationEmailData) {
  try {
    let mjmlTemplate = BookingConfirmed;

    mjmlTemplate = mjmlTemplate.replace(/{{eventTitle}}/g, data.eventTitle);
    mjmlTemplate = mjmlTemplate.replace(/{{hostName}}/g, data.hostName);
    mjmlTemplate = mjmlTemplate.replace(/{{bookingDate}}/g, data.bookingDate);
    mjmlTemplate = mjmlTemplate.replace(/{{startTime}}/g, data.startTime);
    mjmlTemplate = mjmlTemplate.replace(/{{endTime}}/g, data.endTime);
    mjmlTemplate = mjmlTemplate.replace(/{{timeZone}}/g, data.timeZone);
    mjmlTemplate = mjmlTemplate.replace(/{{guestName}}/g, data.guestName);
    mjmlTemplate = mjmlTemplate.replace(/{{location.name}}/g, data.location.name);
    mjmlTemplate = mjmlTemplate.replace(/{{location.address}}/g, data.location.address);

    const { html, errors } = mjml2html(mjmlTemplate);

    if (errors.length) {
      console.error("MJML errors:", errors);
      return;
    }

    await resend.emails.send({
      from: "D2B <onboarding@resend.dev>",
      to: [to],
      subject: "Booking Confirmed | D2B",
      html: html
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

async function sendRequestEmail(to: string, data: RequestEmailData) {
  try {
    let mjmlTemplate = BookingRequest;

    mjmlTemplate = mjmlTemplate.replace(/{{eventTitle}}/g, data.eventTitle);
    mjmlTemplate = mjmlTemplate.replace(/{{hostName}}/g, data.hostName);
    mjmlTemplate = mjmlTemplate.replace(/{{bookingDate}}/g, data.bookingDate);
    mjmlTemplate = mjmlTemplate.replace(/{{startTime}}/g, data.startTime);
    mjmlTemplate = mjmlTemplate.replace(/{{endTime}}/g, data.endTime);
    mjmlTemplate = mjmlTemplate.replace(/{{timeZone}}/g, data.timeZone);
    mjmlTemplate = mjmlTemplate.replace(/{{guestName}}/g, data.guestName);
    mjmlTemplate = mjmlTemplate.replace(/{{location.name}}/g, data.location.name);
    mjmlTemplate = mjmlTemplate.replace(/{{location.address}}/g, data.location.address);

    const { html, errors } = mjml2html(mjmlTemplate);

    if (errors.length) {
      console.error("MJML errors:", errors);
      return;
    }

    await resend.emails.send({
      from: "D2B <onboarding@resend.dev>",
      to: [to],
      subject: "Booking Request | D2B",
      html: html
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

export const emailService = { sendCancellationEmail, sendConfirmationEmail, sendRequestEmail };

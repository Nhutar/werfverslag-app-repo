import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const VAN_ADRES = "Werfverslag App <onboarding@resend.dev>";

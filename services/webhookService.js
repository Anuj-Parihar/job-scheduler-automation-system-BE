import axios from "axios";

export async function sendWebhook(payload) {
  try {
    const response = await axios.post(process.env.WEBHOOK_URL, payload);
    console.log("Webhook delivered:", response.status);
  } catch (error) {
    console.error("Webhook failed:", error.message);
  }
}

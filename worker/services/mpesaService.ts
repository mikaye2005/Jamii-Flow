import type { MpesaStkPushInput } from "../../shared/schemas/payments";
import { nowIsoString } from "../../shared/utils/date";

type MpesaConfig = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
};

type EnvLike = Record<string, unknown>;

function getEnvValue(env: EnvLike, key: string): string | undefined {
  const value = env[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function getMpesaConfig(env: Env): MpesaConfig | null {
  const source = env as unknown as EnvLike;
  const baseUrl = getEnvValue(source, "MPESA_BASE_URL") ?? "https://sandbox.safaricom.co.ke";
  const consumerKey = getEnvValue(source, "MPESA_CONSUMER_KEY");
  const consumerSecret = getEnvValue(source, "MPESA_CONSUMER_SECRET");
  const shortCode = getEnvValue(source, "MPESA_SHORTCODE");
  const passkey = getEnvValue(source, "MPESA_PASSKEY");
  const callbackUrl = getEnvValue(source, "MPESA_CALLBACK_URL");

  if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
    return null;
  }

  return {
    baseUrl,
    consumerKey,
    consumerSecret,
    shortCode,
    passkey,
    callbackUrl,
  };
}

function normalizePhoneNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

function generateTimestamp() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

async function fetchAccessToken(config: MpesaConfig): Promise<string> {
  const basic = btoa(`${config.consumerKey}:${config.consumerSecret}`);
  const response = await fetch(`${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basic}`,
    },
  });
  if (!response.ok) {
    throw new Error("MPESA_AUTH_FAILED");
  }
  const json = (await response.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("MPESA_AUTH_FAILED");
  }
  return json.access_token;
}

export async function initiateMpesaStkPush(env: Env, input: MpesaStkPushInput) {
  const config = getMpesaConfig(env);
  if (!config) {
    throw new Error("MPESA_CONFIG_MISSING");
  }

  const timestamp = generateTimestamp();
  const password = btoa(`${config.shortCode}${config.passkey}${timestamp}`);
  const token = await fetchAccessToken(config);
  const phoneNumber = normalizePhoneNumber(input.phoneNumber);

  const response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.floor(input.amountMinor / 100)),
      PartyA: phoneNumber,
      PartyB: config.shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: config.callbackUrl,
      AccountReference: input.accountReference,
      TransactionDesc: input.transactionDesc,
    }),
  });

  const json = (await response.json()) as {
    ResponseCode?: string;
    ResponseDescription?: string;
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    errorMessage?: string;
  };

  if (!response.ok || json.ResponseCode !== "0") {
    throw new Error(json.errorMessage || json.ResponseDescription || "MPESA_STK_PUSH_FAILED");
  }

  return {
    provider: "MPESA",
    merchantRequestId: json.MerchantRequestID ?? "",
    checkoutRequestId: json.CheckoutRequestID ?? "",
    requestedAt: nowIsoString(),
  };
}

export type MpesaCallbackPayload = {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string;
      CheckoutRequestID?: string;
      ResultCode?: number;
      ResultDesc?: string;
      CallbackMetadata?: {
        Item?: Array<{ Name?: string; Value?: string | number }>;
      };
    };
  };
};

function getCallbackItem(
  items: Array<{ Name?: string; Value?: string | number }> | undefined,
  name: string,
) {
  return items?.find((item) => item.Name === name)?.Value;
}

export function parseMpesaCallback(payload: MpesaCallbackPayload) {
  const callback = payload.Body?.stkCallback;
  if (!callback) {
    throw new Error("INVALID_MPESA_CALLBACK_PAYLOAD");
  }

  const metadataItems = callback.CallbackMetadata?.Item;
  const amount = getCallbackItem(metadataItems, "Amount");
  const mpesaReceiptNumber = getCallbackItem(metadataItems, "MpesaReceiptNumber");
  const phoneNumber = getCallbackItem(metadataItems, "PhoneNumber");
  const transactionDate = getCallbackItem(metadataItems, "TransactionDate");

  return {
    merchantRequestId: callback.MerchantRequestID ?? "",
    checkoutRequestId: callback.CheckoutRequestID ?? "",
    resultCode: callback.ResultCode ?? -1,
    resultDesc: callback.ResultDesc ?? "Unknown callback result",
    amount: typeof amount === "number" ? amount : undefined,
    mpesaReceiptNumber: typeof mpesaReceiptNumber === "string" ? mpesaReceiptNumber : undefined,
    phoneNumber: typeof phoneNumber === "number" ? String(phoneNumber) : undefined,
    transactionDate: typeof transactionDate === "number" ? String(transactionDate) : undefined,
  };
}

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Initializes or resets the invisible reCAPTCHA verifier for Firebase Phone Auth.
 * @param {string} containerId - DOM ID of the container element.
 * @returns {RecaptchaVerifier|null}
 */
export const getRecaptchaVerifier = (containerId = "recaptcha-container") => {
  if (typeof window === "undefined") return null;

  // Clear existing verifier if any
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Failed to clear previous recaptcha verifier:", e);
    }
    window.recaptchaVerifier = null;
  }

  // Ensure container element exists in DOM
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.zIndex = "-1";
    document.body.appendChild(container);
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved - allow signInWithPhoneNumber
    },
    "expired-callback": () => {
      console.warn("reCAPTCHA expired. Please retry.");
    }
  });

  return window.recaptchaVerifier;
};

/**
 * Dispatches real-time SMS OTP via Google Firebase.
 * @param {string} phoneNumber - 10-digit mobile number.
 * @param {string} containerId - Optional reCAPTCHA container ID.
 * @returns {Promise<ConfirmationResult>}
 */
export const sendFirebasePhoneOtp = async (phoneNumber, containerId = "recaptcha-container") => {
  const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }
  const formattedNumber = `+91${cleanPhone}`;

  const verifier = getRecaptchaVerifier(containerId);
  const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, verifier);
  return confirmationResult;
};

/**
 * Verifies the SMS OTP code using Firebase ConfirmationResult.
 * @param {object} confirmationResult - Firebase confirmation result object.
 * @param {string} otpCode - 6-digit verification code.
 * @returns {Promise<{ user: object, token: string }>}
 */
export const verifyFirebasePhoneOtp = async (confirmationResult, otpCode) => {
  if (!confirmationResult || typeof confirmationResult.confirm !== "function") {
    throw new Error("No active verification session. Please request a new OTP code.");
  }
  const cleanCode = (otpCode || "").trim();
  if (cleanCode.length < 4 || cleanCode.length > 6) {
    throw new Error("Please enter the 6-digit verification code.");
  }

  const credential = await confirmationResult.confirm(cleanCode);
  const token = await credential.user.getIdToken();
  return { user: credential.user, token };
};

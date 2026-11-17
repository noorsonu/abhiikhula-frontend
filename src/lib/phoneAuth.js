import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Ensures a visible or accessible reCAPTCHA container is present in the DOM.
 */
function getOrCreateContainer(containerId) {
  if (typeof window === "undefined") return null;
  let el = document.getElementById(containerId);
  if (!el) {
    el = document.createElement("div");
    el.id = containerId;
    el.style.position = "fixed";
    el.style.bottom = "10px";
    el.style.right = "10px";
    el.style.zIndex = "999999";
    document.body.appendChild(el);
  }
  return el;
}

/**
 * Initializes or resets the reCAPTCHA verifier for Firebase Phone Auth.
 * @param {string} containerId - DOM element ID for reCAPTCHA.
 * @returns {RecaptchaVerifier|null}
 */
export const getRecaptchaVerifier = (containerId = "recaptcha-container") => {
  if (typeof window === "undefined") return null;

  getOrCreateContainer(containerId);

  // Clear existing verifier if previously created to avoid stale widget errors
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Cleared existing recaptcha verifier:", e?.message);
    }
    window.recaptchaVerifier = null;
  }

  // Ensure auth has language set
  try {
    auth.useDeviceLanguage();
  } catch (e) {}

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
    "expired-callback": () => {
      console.warn("reCAPTCHA expired. Resetting verifier.");
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    }
  });

  return window.recaptchaVerifier;
};

/**
 * Dispatches real-time SMS OTP via Google Firebase.
 * @param {string} phoneNumber - 10-digit mobile number.
 * @param {string} containerId - DOM ID for reCAPTCHA widget.
 * @returns {Promise<ConfirmationResult>}
 */
export const sendFirebasePhoneOtp = async (phoneNumber, containerId = "recaptcha-container") => {
  const cleanPhone = (phoneNumber || "").replace(/\D/g, "").slice(-10);
  if (cleanPhone.length !== 10) {
    throw new Error("Please enter a valid 10-digit mobile number.");
  }
  const formattedNumber = `+91${cleanPhone}`;

  try {
    const verifier = getRecaptchaVerifier(containerId);
    if (!verifier) {
      throw new Error("Failed to initialize verification service. Please refresh the page.");
    }

    // Explicitly render verifier
    await verifier.render();

    // Call Firebase Auth
    const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, verifier);
    return confirmationResult;
  } catch (error) {
    console.error("Firebase sendFirebasePhoneOtp error details:", error);

    let friendlyMessage = error.message;
    const code = error.code || "";

    if (code === "auth/unauthorized-domain") {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "your domain";
      friendlyMessage = `Current domain '${currentHost}' is not authorized in Firebase. Please add '${currentHost}' to Firebase Console > Authentication > Settings > Authorized domains.`;
    } else if (code === "auth/invalid-phone-number") {
      friendlyMessage = "Invalid phone number format. Please enter a valid 10-digit Indian mobile number.";
    } else if (code === "auth/quota-exceeded") {
      friendlyMessage = "Daily SMS quota exceeded in Firebase. For development, use your test phone number (+91 7052806684 with code 123456).";
    } else if (code === "auth/too-many-requests") {
      friendlyMessage = "Too many OTP requests in a short time. Please wait 2-3 minutes before trying again.";
    } else if (code === "auth/operation-not-allowed") {
      friendlyMessage = "Phone Authentication is not enabled in Firebase Console. Please verify Phone provider is Enabled.";
    } else if (code === "auth/captcha-check-failed") {
      friendlyMessage = "reCAPTCHA verification challenge failed. Please refresh the page and try again.";
    } else if (code === "auth/billing-not-enabled") {
      friendlyMessage = "Firebase SMS quota requires an active billing account or test numbers for development.";
    }

    const err = new Error(friendlyMessage);
    err.code = code;
    err.originalError = error;
    throw err;
  }
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

  try {
    const credential = await confirmationResult.confirm(cleanCode);
    const token = await credential.user.getIdToken();
    return { user: credential.user, token };
  } catch (error) {
    console.error("Firebase verifyFirebasePhoneOtp error details:", error);
    let friendlyMessage = error.message;
    const code = error.code || "";

    if (code === "auth/invalid-verification-code") {
      friendlyMessage = "Invalid verification code. Please check the SMS OTP and enter again.";
    } else if (code === "auth/code-expired") {
      friendlyMessage = "Verification code has expired. Please click 'Resend OTP' to get a fresh code.";
    }

    const err = new Error(friendlyMessage);
    err.code = code;
    throw err;
  }
};

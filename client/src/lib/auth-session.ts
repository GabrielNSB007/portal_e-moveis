const TOKEN_KEY = "emoveis-token";
const EMAIL_KEY = "emoveis-user-email";

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

export const getSessionEmail = () => localStorage.getItem(EMAIL_KEY);
export const setSessionEmail = (email: string) => localStorage.setItem(EMAIL_KEY, email);
export const clearSessionEmail = () => localStorage.removeItem(EMAIL_KEY);

const onboardingKey = (email: string) => `emoveis-onboarded:${email.toLowerCase()}`;

export const hasCompletedOnboarding = (email = getSessionEmail()) =>
  email ? localStorage.getItem(onboardingKey(email)) === "1" : false;

export const markOnboardingComplete = (email = getSessionEmail()) => {
  if (email) {
    localStorage.setItem(onboardingKey(email), "1");
  }
};

export const migrateLegacyOnboardingFlag = (email = getSessionEmail()) => {
  if (email && localStorage.getItem("emoveis-onboarded") === "1") {
    markOnboardingComplete(email);
  }
  clearLegacyOnboardingFlag();
};

export const clearLegacyOnboardingFlag = () => localStorage.removeItem("emoveis-onboarded");

import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";

export const sendOTP = async (email: string) => {
  try {
    const response = await secureFetch(
      `${apiEndpoints.otp.create}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      },
      { allowUnauthenticated: true }
    );
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error(error);
  }
};

export const verifyOTP = async (email: string, otpCode: string) => {
  try {
    const response = await secureFetch(
      `${apiEndpoints.otp.verify}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, otpCode: otpCode }),
      },
      { allowUnauthenticated: true }
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};

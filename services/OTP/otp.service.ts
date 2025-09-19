import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";

export const sendOTP = async (
  personid: number | null,
  email: string | null
) => {
  try {
    let payload = {};
    if (personid && !email) {
      payload = {
        person_id: personid,
      };
    }
    if (!personid && email) {
      payload = {
        email: email,
      };
    }

    const response = await secureFetch(
      `${apiEndpoints.otp.create}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      { allowUnauthenticated: true }
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};

export const verifyOTP = async (
  personid: number | null,
  email: string | null,
  otpCode: string
) => {
  try {
    let payload = {};
    if (personid && !email) {
      payload = {
        person_id: personid,
        otpCode: otpCode,
      };
    }
    if (!personid && email) {
      payload = {
        email: email,
        otpCode: otpCode,
      };
    }

    const response = await secureFetch(
      `${apiEndpoints.otp.verify}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      { allowUnauthenticated: true }
    );
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
  }
};

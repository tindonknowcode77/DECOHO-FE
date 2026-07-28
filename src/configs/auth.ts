const defaultGoogleClientId =
  "1047142545241-pge0ccn9njp66g9sjoo6bgo8dnihlpr6.apps.googleusercontent.com";

export const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || defaultGoogleClientId;

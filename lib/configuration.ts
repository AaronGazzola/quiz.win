const production = process.env.NODE_ENV === "production";

const configuration = {
  site: {
    name: "Quiz.Win",
    description:
      "Play, Learn, Win! Create and complete gamified quizzes at Quiz.Win",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    twitterHandle: "",
    instagramHandle: "",
    facebookHandle: "",
    youtubeHandle: "",
  },
  paths: {
    appHome: "/",
    signIn: "/auth",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    authCallback: "/callback",
    resetPasswordCallback: "/reset-password/callback",
    pricing: "/pricing",
    privacy: "/privacy",
    terms: "/terms",
    faq: "/faq",
  },
  production,
};

export default configuration;

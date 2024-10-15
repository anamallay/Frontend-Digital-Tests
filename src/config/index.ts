import "dotenv/config";

export const dev = {
  app: {
    backendUrl: process.env.BACKEND_URL || "",
  },
};

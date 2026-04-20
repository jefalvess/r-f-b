const { z } = require("zod");

const loginSchema = z.object({
  body: z
    .object({
      userName: z.string().min(1).optional(),
      password: z.string().min(6).optional(),
      refreshToken: z.string().min(10).optional(),
    })
    .refine(
      (data) => {
        const hasRefreshToken = Boolean(data.refreshToken);
        const hasCredentials = Boolean(data.userName && data.password);
        const isEmptyBody = !data.refreshToken && !data.userName && !data.password;
        return hasRefreshToken || hasCredentials || isEmptyBody;
      },
      {
        message: "Informe userName/password ou refreshToken",
      }
    ),
  params: z.object({}),
  query: z.object({}),
});

module.exports = { loginSchema };

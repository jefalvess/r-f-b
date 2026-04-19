require("dotenv").config();

const app = require("./app");

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API executando na porta ${PORT}`);
});

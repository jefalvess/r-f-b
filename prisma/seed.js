const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@restaurante.local";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Administrador",
        email,
        passwordHash,
        role: "admin",
        active: true,
      },
    });
  }

  const categories = ["almoco", "lanche", "bebida", "sobremesa", "adicional"];
  for (const name of categories) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, active: true },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("Seed executado com sucesso");
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

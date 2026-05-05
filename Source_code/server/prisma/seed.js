const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('rk@1234', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'rk' },
        update: {
            password: hashedPassword,
        },
        create: {
            username: 'rk',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

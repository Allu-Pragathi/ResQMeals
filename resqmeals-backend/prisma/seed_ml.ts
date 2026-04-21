import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const donors = [
        { name: 'Marriott Hyderabad', email: 'marriott@hotel.com', lat: 17.4239, lng: 78.4738 },
        { name: 'Paradise Biryani', email: 'paradise@food.com', lat: 17.4436, lng: 78.4983 },
        { name: 'Hotel Taj Vivanta', email: 'taj@hotel.com', lat: 17.4562, lng: 78.4611 },
        { name: 'Bawarchi Restaurant', email: 'bawarchi@food.com', lat: 17.4087, lng: 78.4907 }
    ];

    const ngos = [
        { name: 'Helping Hands', email: 'helping@ngo.org', lat: 17.4400, lng: 78.3489 },
        { name: 'Feed The Need', email: 'feed@ngo.org', lat: 17.4483, lng: 78.3915 }
    ];

    console.log('Seeding ML Training Data...');

    for (const d of donors) {
        const user = await prisma.user.upsert({
            where: { email: d.email },
            update: {},
            create: {
                name: d.name,
                email: d.email,
                password: hashedPassword,
                role: 'DONOR',
                address: 'Hyderabad, TS',
                latitude: d.lat,
                longitude: d.lng,
                isVerified: true,
                isEmailVerified: true
            }
        });

        // Seed 10-15 donations for each donor
        for (let i = 0; i < 15; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            const donation = await prisma.donation.create({
                data: {
                    foodType: ['Veg Meals', 'Bakery', 'Fruits', 'Biryani'][Math.floor(Math.random() * 4)],
                    quantity: `${Math.floor(Math.random() * 20 + 5)} kg`,
                    expiry: '4 hours',
                    location: 'Kitchen A',
                    latitude: d.lat + (Math.random() - 0.5) * 0.01,
                    longitude: d.lng + (Math.random() - 0.5) * 0.01,
                    status: 'Delivered',
                    createdAt: date,
                    donorId: user.id
                }
            });

            // Randomly assign to an NGO for historical matching
            const ngoEmail = ngos[Math.floor(Math.random() * ngos.length)].email;
            const ngo = await prisma.user.findUnique({ where: { email: ngoEmail } });
            if (ngo) {
                await prisma.request.create({
                    data: {
                        donationId: donation.id,
                        ngoId: ngo.id,
                        status: 'Approved',
                        createdAt: date
                    }
                });
            }
        }
    }

    console.log('✓ Seeded 60+ historical donations for ML Training.');
}

main().catch(e => { console.error(e); process.exit(1); });

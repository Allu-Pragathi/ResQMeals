import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Create NGOS with real coordinates
  const ngos = [
    {
      name: 'Mumbai Roti Bank',
      email: 'contact@rotibankindia.org',
      role: 'NGO',
      address: '1701, One World Centre, Mumbai 400013',
      phone: '9123456789',
      latitude: 19.0176,
      longitude: 72.8281,
      isVerified: true
    },
    {
      name: 'Uday Foundation',
      email: 'info@udayfoundation.org',
      role: 'NGO',
      address: 'D-233, Block D, Sarvodaya Enclave, New Delhi 110017',
      phone: '9876543210',
      latitude: 28.5397,
      longitude: 77.2006,
      isVerified: true
    },
    {
      name: 'Akshaya Patra Foundation',
      email: 'contact@akshayapatra.org',
      role: 'NGO',
      address: 'HK Hill, Chord Rd, Rajajinagar, Bengaluru 560010',
      phone: '8012345678',
      latitude: 13.0305,
      longitude: 77.5505,
      isVerified: true
    },
    {
      name: 'Feeding India',
      email: 'hello@feedingindia.org',
      role: 'NGO',
      address: '19th Floor, DLF Epitome, Gurugram 122002',
      phone: '9988776655',
      latitude: 28.4950,
      longitude: 77.0890,
      isVerified: true
    },
    {
      name: 'No Food Waste',
      email: 'feed@nofoodwaste.org',
      role: 'NGO',
      address: 'Vinayaka Nagar, Bengaluru 560017',
      phone: '9000011122',
      latitude: 12.9141,
      longitude: 77.6412,
      isVerified: true
    }
  ];

  for (const ngo of ngos) {
    await prisma.user.upsert({
      where: { email: ngo.email },
      update: {},
      create: {
        ...ngo,
        password,
      },
    });
  }

  // 2. Create Donors (Restaurants) with coordinates
  const donors = [
    {
      name: 'Taj Mahal Palace',
      email: 'donations@tajmumbai.com',
      role: 'DONOR',
      address: 'Apollo Bandar, Colaba, Mumbai 400001',
      phone: '2233445566',
      latitude: 18.9218,
      longitude: 72.8333
    },
    {
      name: 'ITC Maurya',
      email: 'surplus@itcmaurya.com',
      role: 'DONOR',
      address: 'Sardar Patel Marg, Akhaura Block, New Delhi 110021',
      phone: '1122334455',
      latitude: 28.5975,
      longitude: 77.1724
    },
    {
      name: 'The Oberoi',
      email: 'help@oberoibangalore.com',
      role: 'DONOR',
      address: 'MG Road, Bangalore 560001',
      phone: '8099887766',
      latitude: 12.9733,
      longitude: 77.6200
    }
  ];

  const createdDonors = [];
  for (const donor of donors) {
    const d = await prisma.user.upsert({
      where: { email: donor.email },
      update: {},
      create: {
        ...donor,
        password,
      },
    });
    createdDonors.push(d);
  }

  // 3. Create Sample Donations
  const donationData = [
    {
      foodType: 'Buffet Surplus (Vegetarian)',
      quantity: '50 servings',
      expiry: '3 hours',
      location: 'Colaba, Mumbai',
      latitude: 18.9218,
      longitude: 72.8333,
      donorId: createdDonors[0].id, // Taj Mumbai
    },
    {
      foodType: 'Fresh Bread & Pastries',
      quantity: '20 kg',
      expiry: '8 hours',
      location: 'Chanakyapuri, Delhi',
      latitude: 28.5975,
      longitude: 77.1724,
      donorId: createdDonors[1].id, // ITC Maurya
    },
    {
      foodType: 'Rice and Daal',
      quantity: '100 servings',
      expiry: '4 hours',
      location: 'MG Road, Bangalore',
      latitude: 12.9733,
      longitude: 77.6200,
      donorId: createdDonors[2].id, // Oberoi
    }
  ];

  for (const donation of donationData) {
    await prisma.donation.create({
      data: {
        ...donation,
        status: 'Pending',
      }
    });
  }

  console.log('Seed data with real coordinates created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

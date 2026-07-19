const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  const hash = (pw) => bcrypt.hash(pw, SALT_ROUNDS);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@storerank.com' },
    update: {},
    create: {
      name: 'Administrator Account Holder Name',
      email: 'admin@storerank.com',
      passwordHash: await hash('Admin@1234'),
      address: '1 Platform Way, Admin City, AC 10001',
      role: 'ADMIN',
    },
  });

  const owner1 = await prisma.user.upsert({
    where: { email: 'owner1@storerank.com' },
    update: {},
    create: {
      name: 'Owner One Coffee Roasters Manager',
      email: 'owner1@storerank.com',
      passwordHash: await hash('Owner@1234'),
      address: '22 Roastery Lane, Brewtown, BT 20002',
      role: 'OWNER',
    },
  });

  const owner2 = await prisma.user.upsert({
    where: { email: 'owner2@storerank.com' },
    update: {},
    create: {
      name: 'Owner Two Hardware Supply Manager',
      email: 'owner2@storerank.com',
      passwordHash: await hash('Owner@1234'),
      address: '8 Tool Street, Fixerville, FV 30003',
      role: 'OWNER',
    },
  });

  const owner3 = await prisma.user.upsert({
    where: { email: 'owner3@storerank.com' },
    update: {},
    create: {
      name: 'Owner Three Bookstore General Manager',
      email: 'owner3@storerank.com',
      passwordHash: await hash('Owner@1234'),
      address: '5 Reading Road, Pagesburg, PB 40004',
      role: 'OWNER',
    },
  });

  const users = [];
  const userSeed = [
    ['normal.user.number.one@storerank.com', 'Regular Customer Alpha Testing Name'],
    ['normal.user.number.two@storerank.com', 'Regular Customer Beta Testing Person'],
    ['normal.user.number.three@storerank.com', 'Regular Customer Gamma Testing Human'],
  ];
  for (const [email, name] of userSeed) {
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        passwordHash: await hash('User@1234'),
        address: '100 Residential Ave, Hometown, HT 50005',
        role: 'USER',
      },
    });
    users.push(u);
  }

  const storeDefs = [
    {
      name: 'Downtown Coffee Roasters Flagship',
      email: 'contact@downtownroasters.com',
      address: '22 Roastery Lane, Brewtown, BT 20002',
      ownerId: owner1.id,
    },
    {
      name: 'Fixerville Hardware Supply Depot',
      email: 'sales@fixervillehardware.com',
      address: '8 Tool Street, Fixerville, FV 30003',
      ownerId: owner2.id,
    },
    {
      name: 'Pagesburg Independent Bookstore Shop',
      email: 'hello@pagesburgbooks.com',
      address: '5 Reading Road, Pagesburg, PB 40004',
      ownerId: owner3.id,
    },
    {
      name: 'Riverside Farmers Market Collective',
      email: 'info@riversidemarket.com',
      address: '17 Riverside Drive, Millhaven, MH 60006',
      ownerId: null,
    },
  ];

  const stores = [];
  for (const s of storeDefs) {
    const existing = await prisma.store.findFirst({ where: { email: s.email } });
    const store = existing
      ? existing
      : await prisma.store.create({ data: s });
    stores.push(store);
  }

  const ratingMatrix = [
    [5, 4, 3],
    [3, 4, 5],
    [4, 5, 4],
    [2, 3, null],
  ];

  for (let si = 0; si < stores.length; si++) {
    for (let ui = 0; ui < users.length; ui++) {
      const rating = ratingMatrix[si][ui];
      if (rating === null) continue;
      await prisma.rating.upsert({
        where: { userId_storeId: { userId: users[ui].id, storeId: stores[si].id } },
        update: { rating },
        create: { userId: users[ui].id, storeId: stores[si].id, rating },
      });
    }
  }

  // --- Additional Indian stores, owners, users, and reviews ---

  const indiaOwnerSeed = [
    [
      'owner.bengaluru@storerank.com',
      'Owner Bengaluru Coffee House Proprietor',
      '14 Church Street, Bengaluru, Karnataka, 560001',
    ],
    [
      'owner.mumbai@storerank.com',
      'Owner Mumbai Electronics Bazaar Manager',
      '221 Lamington Road, Mumbai, Maharashtra, 400007',
    ],
    [
      'owner.jaipur@storerank.com',
      'Owner Jaipur Handicrafts Emporium Chief',
      '9 Johari Bazaar, Jaipur, Rajasthan, 302003',
    ],
  ];

  const indiaOwners = [];
  for (const [email, name, address] of indiaOwnerSeed) {
    const o = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, passwordHash: await hash('Owner@1234'), address, role: 'OWNER' },
    });
    indiaOwners.push(o);
  }

  const indiaUserSeed = [
    ['ananya.iyer@storerank.com', 'Ananya Krishnan Iyer Customer Account', '45 MG Road, Bengaluru, Karnataka, 560025'],
    ['rohit.sharma.cust@storerank.com', 'Rohit Sharma Regular Platform Customer', '12 Andheri West, Mumbai, Maharashtra, 400058'],
    ['priya.nair@storerank.com', 'Priya Nair Verified Shopper Account Holder', '78 Marine Drive, Kochi, Kerala, 682031'],
  ];

  const indiaUsers = [];
  for (const [email, name, address] of indiaUserSeed) {
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, passwordHash: await hash('User@1234'), address, role: 'USER' },
    });
    indiaUsers.push(u);
  }

  const indiaStoreDefs = [
    {
      name: 'Bengaluru Artisan Coffee House',
      email: 'hello@bengalurucoffee.in',
      address: '14 Church Street, Bengaluru, Karnataka, 560001',
      ownerId: indiaOwners[0].id,
    },
    {
      name: 'Mumbai Electronics Bazaar Central',
      email: 'sales@mumbaielectronics.in',
      address: '221 Lamington Road, Mumbai, Maharashtra, 400007',
      ownerId: indiaOwners[1].id,
    },
    {
      name: 'Delhi Heritage Bookstore Corner',
      email: 'contact@delhiheritagebooks.in',
      address: '31 Connaught Place, New Delhi, Delhi, 110001',
      ownerId: null,
    },
    {
      name: 'Chennai South Indian Kitchen Diner',
      email: 'info@chennaikitchen.in',
      address: '56 T Nagar, Chennai, Tamil Nadu, 600017',
      ownerId: null,
    },
    {
      name: 'Jaipur Handicrafts Emporium Store',
      email: 'orders@jaipurhandicrafts.in',
      address: '9 Johari Bazaar, Jaipur, Rajasthan, 302003',
      ownerId: indiaOwners[2].id,
    },
    {
      name: 'Pune Organic Grocery Market Hub',
      email: 'support@puneorganic.in',
      address: '63 Koregaon Park, Pune, Maharashtra, 411001',
      ownerId: null,
    },
  ];

  const indiaStores = [];
  for (const s of indiaStoreDefs) {
    const existing = await prisma.store.findFirst({ where: { email: s.email } });
    const store = existing ? existing : await prisma.store.create({ data: s });
    indiaStores.push(store);
  }

  const indiaReviewMatrix = [
    // Bengaluru Coffee, Mumbai Electronics, Delhi Bookstore, Chennai Kitchen, Jaipur Handicrafts, Pune Grocery
    [
      { rating: 5, comment: 'Great filter coffee, quick and friendly service.' },
      { rating: 4, comment: 'Good range of gadgets, slightly pricey.' },
      { rating: 4, comment: 'Lovely collection of old and new titles.' },
      { rating: 5, comment: 'Authentic taste, reminded me of home cooking.' },
      { rating: 5, comment: 'Beautiful handmade items, great for gifting.' },
      { rating: 4, comment: 'Fresh produce, reasonably priced.' },
    ],
    [
      { rating: 4, comment: 'Cosy place, bit crowded on weekends.' },
      { rating: 5, comment: 'Staff helped me pick the right laptop accessories.' },
      { rating: 3, comment: 'Decent selection but limited English fiction.' },
      { rating: 4, comment: 'Great thali, service was a bit slow.' },
      { rating: 4, comment: 'Good quality blue pottery.' },
      { rating: 5, comment: 'Best organic vegetables in the area.' },
    ],
    [
      { rating: 5, comment: 'My go-to coffee spot every morning.' },
      { rating: 3, comment: 'Average experience, warranty support was slow.' },
      { rating: 5, comment: 'Found a rare first edition here, amazing.' },
      { rating: 4, comment: 'Consistent quality every time I visit.' },
      { rating: 3, comment: 'Nice items but a bit overpriced.' },
      { rating: 4, comment: 'Good variety of millets and pulses.' },
    ],
  ];

  for (let si = 0; si < indiaStores.length; si++) {
    for (let ui = 0; ui < indiaUsers.length; ui++) {
      const entry = indiaReviewMatrix[ui]?.[si];
      if (!entry) continue;
      await prisma.rating.upsert({
        where: { userId_storeId: { userId: indiaUsers[ui].id, storeId: indiaStores[si].id } },
        update: { rating: entry.rating, comment: entry.comment },
        create: {
          userId: indiaUsers[ui].id,
          storeId: indiaStores[si].id,
          rating: entry.rating,
          comment: entry.comment,
        },
      });
    }
  }

  console.log('Seed complete.');
  console.log('Admin login: admin@storerank.com / Admin@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

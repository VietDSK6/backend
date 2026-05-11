/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const badges = [
  {
    name: 'Người mới bắt đầu',
    description: 'Hoàn thành 10 giờ tình nguyện',
    icon_url: '🌱',
    required_hours: 10,
  },
  {
    name: 'Tình nguyện viên',
    description: 'Hoàn thành 25 giờ tình nguyện',
    icon_url: '⭐',
    required_hours: 25,
  },
  {
    name: 'Người cống hiến',
    description: 'Hoàn thành 50 giờ tình nguyện',
    icon_url: '🏅',
    required_hours: 50,
  },
  {
    name: 'Chiến binh xanh',
    description: 'Hoàn thành 100 giờ tình nguyện',
    icon_url: '🛡️',
    required_hours: 100,
  },
  {
    name: 'Huyền thoại',
    description: 'Hoàn thành 200 giờ tình nguyện',
    icon_url: '👑',
    required_hours: 200,
  },
];

async function main() {
  console.log('🌱 Seeding badges...');

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { id: badge.name }, // won't match — forces create
      update: {},
      create: badge,
    });
  }

  console.log(`✅ Seeded ${badges.length} badges`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

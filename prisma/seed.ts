import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient, Role, LeadStatus, Priority, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

const demoPassword = 'Password123!';

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const userDefaults = {
    password: passwordHash,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    lastActivity: new Date(),
    lastOnline: new Date(),
  };

  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.com' },
    update: userDefaults,
    create: {
      name: 'System Admin',
      email: 'admin@crm.com',
      password: passwordHash,
      phone: '+1-555-0100',
      company: 'Break&Build CRM',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      lastActivity: new Date(),
      lastOnline: new Date(),
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@crm.com' },
    update: userDefaults,
    create: {
      name: 'Sarah Manager',
      email: 'manager@crm.com',
      password: passwordHash,
      phone: '+1-555-0101',
      company: 'Break&Build CRM',
      role: Role.MANAGER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      lastActivity: new Date(),
      lastOnline: new Date(),
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@crm.com' },
    update: userDefaults,
    create: {
      name: 'John Employee',
      email: 'employee@crm.com',
      password: passwordHash,
      phone: '+1-555-0102',
      company: 'Break&Build CRM',
      role: Role.EMPLOYEE,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      lastActivity: new Date(),
      lastOnline: new Date(),
    },
  });

  const leadsData = [
    {
      fullName: 'Alice Johnson',
      company: 'TechCorp Inc',
      email: 'alice@techcorp.com',
      phone: '+1-555-1001',
      source: 'Website',
      status: LeadStatus.NEW,
      priority: Priority.HIGH,
      assignedToId: employee.id,
      createdById: manager.id,
      notes: 'Interested in enterprise plan',
    },
    {
      fullName: 'Bob Smith',
      company: 'Global Solutions',
      email: 'bob@globalsolutions.com',
      phone: '+1-555-1002',
      source: 'Referral',
      status: LeadStatus.CONTACTED,
      priority: Priority.MEDIUM,
      assignedToId: employee.id,
      createdById: manager.id,
    },
    {
      fullName: 'Carol Davis',
      company: 'StartupXYZ',
      email: 'carol@startupxyz.com',
      phone: '+1-555-1003',
      source: 'LinkedIn',
      status: LeadStatus.QUALIFIED,
      priority: Priority.HIGH,
      assignedToId: employee.id,
      createdById: admin.id,
    },
    {
      fullName: 'David Wilson',
      company: 'Enterprise Co',
      email: 'david@enterprise.com',
      phone: '+1-555-1004',
      source: 'Trade Show',
      status: LeadStatus.PROPOSAL_SENT,
      priority: Priority.URGENT,
      assignedToId: manager.id,
      createdById: admin.id,
    },
    {
      fullName: 'Eva Martinez',
      company: 'Retail Plus',
      email: 'eva@retailplus.com',
      phone: '+1-555-1005',
      source: 'Cold Call',
      status: LeadStatus.NEGOTIATION,
      priority: Priority.HIGH,
      assignedToId: manager.id,
      createdById: manager.id,
    },
    {
      fullName: 'Frank Lee',
      company: 'Finance Hub',
      email: 'frank@financehub.com',
      phone: '+1-555-1006',
      source: 'Website',
      status: LeadStatus.WON,
      priority: Priority.MEDIUM,
      assignedToId: employee.id,
      createdById: manager.id,
    },
    {
      fullName: 'Grace Kim',
      company: 'Media Group',
      email: 'grace@mediagroup.com',
      phone: '+1-555-1007',
      source: 'Email Campaign',
      status: LeadStatus.LOST,
      priority: Priority.LOW,
      assignedToId: employee.id,
      createdById: manager.id,
    },
  ];

  for (const lead of leadsData) {
    const created = await prisma.lead.create({ data: lead });
    await prisma.activity.create({
      data: {
        type: 'LEAD_CREATED',
        description: `Lead "${created.fullName}" was created`,
        leadId: created.id,
        userId: lead.createdById,
      },
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'SEED',
        entity: 'SYSTEM',
        details: { message: 'Database seeded with demo data' },
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: employee.id,
        title: 'Welcome to CRM',
        message: 'Your account has been set up. Start managing your leads!',
        type: 'SYSTEM',
      },
      {
        userId: manager.id,
        title: 'New leads assigned',
        message: '3 new leads have been assigned to your team.',
        type: 'LEAD',
      },
    ],
  });

  console.log('Seed completed successfully');
  console.log('Demo accounts (password: Password123!):');
  console.log('  admin@crm.com (ADMIN)');
  console.log('  manager@crm.com (MANAGER)');
  console.log('  employee@crm.com (EMPLOYEE)');
}

main()
  .catch((e: Error) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

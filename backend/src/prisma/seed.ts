import { PrismaClient } from '@prisma/client';
import { RFP_STATUS, SUPPLIER_RESPONSE_STATUS } from '../utils/enum';
import { notificationService } from '../services/notification.service';

const prisma = new PrismaClient();

const buyerPermissions = {
  rfp: {
    create: { allowed: true },
    view: { allowed: true, scope: 'own' },
    edit: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Draft'] },
    publish: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Draft'] },
    close: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Published'] },
    cancel: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Draft', 'Published'] },
    award: { allowed: true, scope: 'own', allowed_rfp_statuses: ['Published', 'Closed'] },
    review_responses: { allowed: true, scope: 'own' },
    read_responses: {allowed: true, scope: "own"},
    manage_documents: { allowed: true, scope: 'own' },
  },
  supplier_response: {
    submit: { allowed: false },
    view: { allowed: true, scope: 'rfp_owner' },
    edit: { allowed: false },
    create: { allowed: false },
    manage_documents: { allowed: false },
    review: { allowed: true, scope: 'rfp_owner' },
    approve: { allowed: true, scope: 'rfp_owner', allowed_response_statuses: ['Under Review'] },
    reject: { allowed: true, scope: 'rfp_owner', allowed_response_statuses: ['Under Review'] },
    award: { allowed: true, scope: 'rfp_owner', allowed_response_statuses: ['Approved'] },
    reopen: { allowed: true, scope: 'rfp_owner', allowed_response_statuses: ['Rejected'] },
  },
  documents: {
    upload_for_rfp: { allowed: true, scope: 'own' },
    upload_for_response: { allowed: false }
  },
  audit: { view: { allowed: true, scope: 'own' } },
  navbar: "dashboard,my_rfps,create_rfp,browse_rfps"
};

const supplierPermissions = {
    rfp: {
        create: { allowed: false },
        view: { allowed: true, allowed_rfp_statuses: ['Published',"Awarded","Rejected"] },
        edit: { allowed: false },
        publish: { allowed: false },
        close: { allowed: false },
        cancel: { allowed: false },
        award: { allowed: false },
        review_responses: { allowed: false },
        read_responses: {allowed: true },
        manage_documents: { allowed: false },
    },
    supplier_response: {
        create: { allowed: true, allowed_rfp_statuses: ['Published'] },
        submit: { allowed: true, scope: 'own', allowed_response_statuses: ['Draft'] },
        view: { allowed: true, scope: 'own' },
        edit: { allowed: true, scope: 'own', allowed_response_statuses: ['Draft'] },
        manage_documents: { allowed: true, scope: 'own' },
        approve: { allowed: false },
        reject: { allowed: false },
        award: { allowed: false },
        reopen: { allowed: false },
    },
    documents: {
        upload_for_rfp: { allowed: false },
        upload_for_response: { allowed: true, scope: 'own' },
    },
    audit: { view: { allowed: true, scope: 'own' } },
    navbar: "dashboard,browse_rfps,my_responses,audit"
};

const adminPermissions = {
    rfp: {
        create: { allowed: true },
        view: { allowed: true },
        edit: { allowed: true },
        publish: { allowed: true },
        close: { allowed: true },
        cancel: { allowed: true },
        award: { allowed: true },
        review_responses: { allowed: true },
        read_responses: { allowed: true },
        manage_documents: { allowed: true },
    },
    supplier_response: {
        create: { allowed: true },
        submit: { allowed: true },
        view: { allowed: true },
        edit: { allowed: true },
        manage_documents: { allowed: true },
        review: { allowed: true },
        approve: { allowed: true },
        reject: { allowed: true },
        award: { allowed: true },
        reopen: { allowed: true },
    },
    documents: {
        upload_for_rfp: { allowed: true },
        upload_for_response: { allowed: true },
    },
    admin: {
        manage_users: { allowed: true },
        manage_roles: { allowed: true },
        view_analytics: { allowed: true }
    },
    audit: { view: { allowed: true } },
    navbar: "dashboard,users,analytics,audit,rfps,responses,permissions"
};


async function main() {
  console.log(`Start seeding ...`);

  await prisma.role.upsert({
    where: { name: 'Buyer' },
    update: { permissions: buyerPermissions },
    create: {
      name: 'Buyer',
      description: 'Users who can create and manage RFPs.',
      permissions: buyerPermissions,
    },
  });
  console.log('Buyer role created/updated.');

  await prisma.role.upsert({
    where: { name: 'Supplier' },
    update: { permissions: supplierPermissions },
    create: {
      name: 'Supplier',
      description: 'Users who can respond to RFPs.',
      permissions: supplierPermissions,
    },
  });
  console.log('Supplier role created/updated.');

  await prisma.role.upsert({
    where: { name: 'Admin' },
    update: { permissions: adminPermissions },
    create: {
      name: 'Admin',
      description: 'System administrators with full access.',
      permissions: adminPermissions,
    },
  });
  console.log('Admin role created/updated.');

  for (const status of Object.values(RFP_STATUS)) {
    await prisma.rFPStatus.upsert({
        where: { code: status },
        update: {},
        create: {
            code: status,
            label: status,
        },
    });
  }
  console.log('RFP statuses seeded.');

  for (const status of Object.values(SUPPLIER_RESPONSE_STATUS)) {
    await prisma.supplierResponseStatus.upsert({
        where: { code: status },
        update: {},
        create: {
            code: status,
            label: status,
        },
    });
  }
  console.log('Supplier response statuses seeded.');

  // Initialize notification templates
  await notificationService.initializeDefaultTemplates();
  console.log('Notification templates initialized!');

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
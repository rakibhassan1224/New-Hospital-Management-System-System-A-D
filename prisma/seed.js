const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create Departments
  const cardiology = await prisma.department.upsert({
    where: { name: 'Cardiology' },
    update: {},
    create: { name: 'Cardiology' },
  });
  const pediatrics = await prisma.department.upsert({
    where: { name: 'Pediatrics' },
    update: {},
    create: { name: 'Pediatrics' },
  });
  const general = await prisma.department.upsert({
    where: { name: 'General Medicine' },
    update: {},
    create: { name: 'General Medicine' },
  });

  // Create Users (Admin, Doctor, Receptionist)
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hms.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@hms.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const receptionist = await prisma.user.upsert({
    where: { email: 'receptionist@hms.com' },
    update: {},
    create: {
      name: 'Front Desk',
      email: 'receptionist@hms.com',
      password: passwordHash,
      role: 'RECEPTIONIST',
    },
  });

  const doctorUser1 = await prisma.user.upsert({
    where: { email: 'dr.smith@hms.com' },
    update: {},
    create: {
      name: 'Dr. John Smith',
      email: 'dr.smith@hms.com',
      password: passwordHash,
      role: 'DOCTOR',
    },
  });

  const doctorUser2 = await prisma.user.upsert({
    where: { email: 'dr.jane@hms.com' },
    update: {},
    create: {
      name: 'Dr. Jane Doe',
      email: 'dr.jane@hms.com',
      password: passwordHash,
      role: 'DOCTOR',
    },
  });

  // Create Doctor Profiles
  const doctor1 = await prisma.doctor.upsert({
    where: { userId: doctorUser1.id },
    update: {},
    create: {
      userId: doctorUser1.id,
      name: doctorUser1.name,
      specialization: 'Cardiologist',
      departmentId: cardiology.id,
      availability: 'Mon-Fri 09:00-17:00',
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctorUser2.id },
    update: {},
    create: {
      userId: doctorUser2.id,
      name: doctorUser2.name,
      specialization: 'General Physician',
      departmentId: general.id,
      availability: 'Mon-Wed-Fri 10:00-16:00',
    },
  });

  // Create Patients
  const patient1 = await prisma.patient.upsert({
    where: { icNumber: '900101-14-5555' },
    update: {},
    create: {
      fullName: 'Alice Bob',
      icNumber: '900101-14-5555',
      dob: new Date('1990-01-01'),
      gender: 'Female',
      phone: '012-3456789',
      address: '123 Main St',
      bloodType: 'O+',
      allergies: 'Penicillin',
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { icNumber: '850505-10-1234' },
    update: {},
    create: {
      fullName: 'Charlie Davis',
      icNumber: '850505-10-1234',
      dob: new Date('1985-05-05'),
      gender: 'Male',
      phone: '011-1112223',
      address: '456 Oak Ave',
      bloodType: 'A-',
      allergies: 'None',
    },
  });

  // Create Appointments
  const appointment1 = await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      doctorId: doctor1.id,
      date: new Date(),
      time: '10:00',
      status: 'SCHEDULED',
      reason: 'Heart checkup',
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      doctorId: doctor2.id,
      date: new Date(),
      time: '14:30',
      status: 'COMPLETED',
      reason: 'Fever',
    },
  });

  // Create Medical Record
  await prisma.medicalRecord.create({
    data: {
      appointmentId: appointment2.id,
      diagnosis: 'Viral Fever',
      prescription: 'Paracetamol 500mg, 3 times a day',
      notes: 'Advised rest and hydration.',
    },
  });

  // Create Invoice
  await prisma.invoice.create({
    data: {
      appointmentId: appointment2.id,
      amount: 150.0,
      status: 'PAID',
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

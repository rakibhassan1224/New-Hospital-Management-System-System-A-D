const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Generating realistic mock data for dashboard...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Add More Departments
  const departments = ['Neurology', 'Orthopedics', 'Dermatology', 'Oncology', 'Emergency'];
  const createdDepts = [];
  for (const name of departments) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    createdDepts.push(dept);
  }

  const neurology = createdDepts[0];
  const orthopedics = createdDepts[1];
  const dermatology = createdDepts[2];

  // 2. Add More Doctors
  const docsData = [
    { name: 'Dr. Sarah Lee', email: 'dr.sarah@hms.com', spec: 'Neurologist', deptId: neurology.id },
    { name: 'Dr. Michael Chen', email: 'dr.michael@hms.com', spec: 'Orthopedic Surgeon', deptId: orthopedics.id },
    { name: 'Dr. Emily Wong', email: 'dr.emily@hms.com', spec: 'Dermatologist', deptId: dermatology.id },
    { name: 'Dr. Robert King', email: 'dr.robert@hms.com', spec: 'General Physician', deptId: neurology.id },
  ];

  const createdDoctors = [];
  for (const doc of docsData) {
    const user = await prisma.user.upsert({
      where: { email: doc.email },
      update: {},
      create: { name: doc.name, email: doc.email, password: passwordHash, role: 'DOCTOR' },
    });
    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: user.name,
        specialization: doc.spec,
        departmentId: doc.deptId,
        availability: 'Mon-Fri 09:00-17:00',
      },
    });
    createdDoctors.push(doctor);
  }

  // 3. Add More Patients
  const patientsData = [
    { name: 'John Doe', ic: '800101-10-1234', dob: '1980-01-01', gender: 'Male', phone: '012-1111111', blood: 'A+' },
    { name: 'Jane Smith', ic: '920202-14-5678', dob: '1992-02-02', gender: 'Female', phone: '012-2222222', blood: 'B-' },
    { name: 'David Lee', ic: '750303-10-9012', dob: '1975-03-03', gender: 'Male', phone: '013-3333333', blood: 'O+' },
    { name: 'Siti Nurhaliza', ic: '880404-10-3456', dob: '1988-04-04', gender: 'Female', phone: '014-4444444', blood: 'AB+' },
    { name: 'Ahmad bin Ali', ic: '950505-14-7890', dob: '1995-05-05', gender: 'Male', phone: '019-5555555', blood: 'O-' },
  ];

  const createdPatients = [];
  for (const p of patientsData) {
    const patient = await prisma.patient.upsert({
      where: { icNumber: p.ic },
      update: {},
      create: {
        fullName: p.name,
        icNumber: p.ic,
        dob: new Date(p.dob),
        gender: p.gender,
        phone: p.phone,
        address: 'Kuala Lumpur',
        bloodType: p.blood,
        allergies: 'None',
      },
    });
    createdPatients.push(patient);
  }

  // 4. Add Realistic Appointments & History (Mixed statuses)
  // Let's create some completed appointments from the past few days and scheduled ones for tomorrow.
  
  const today = new Date();
  
  // Past Appointments (Completed)
  for (let i = 0; i < 6; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - (i + 1));
    
    const apt = await prisma.appointment.create({
      data: {
        patientId: createdPatients[i % createdPatients.length].id,
        doctorId: createdDoctors[i % createdDoctors.length].id,
        date: pastDate,
        time: '10:00',
        status: 'COMPLETED',
        reason: 'Routine checkup and diagnosis',
      },
    });

    await prisma.medicalRecord.create({
      data: {
        appointmentId: apt.id,
        diagnosis: 'General Fatigue and Muscle Pain',
        prescription: 'Rest, Vitamin C',
        notes: 'Patient advised to drink more water.',
      },
    });

    await prisma.invoice.create({
      data: {
        appointmentId: apt.id,
        amount: 150.0,
        status: 'PAID', // Most past invoices are paid
      },
    });
  }

  // Upcoming Appointments (Scheduled)
  for (let i = 0; i < 4; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + (i + 1));
    
    const apt = await prisma.appointment.create({
      data: {
        patientId: createdPatients[(i + 2) % createdPatients.length].id,
        doctorId: createdDoctors[(i + 1) % createdDoctors.length].id,
        date: futureDate,
        time: '11:30',
        status: 'SCHEDULED',
        reason: 'Follow-up consultation',
      },
    });

    // Unpaid invoice generated on booking
    await prisma.invoice.create({
      data: {
        appointmentId: apt.id,
        amount: 150.0,
        status: 'UNPAID',
      },
    });
  }

  // Cancelled Appointments
  await prisma.appointment.create({
    data: {
      patientId: createdPatients[0].id,
      doctorId: createdDoctors[0].id,
      date: today,
      time: '15:00',
      status: 'CANCELLED',
      reason: 'Patient requested cancellation',
    },
  });

  console.log('Successfully injected lots of mock data! Dashboard will look realistic now.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

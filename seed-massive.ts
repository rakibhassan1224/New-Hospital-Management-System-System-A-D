import { prisma } from './src/lib/db';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding massive mock data: 50 patients, 20 doctors...");
  
  // 1. Check existing departments to assign doctors to
  let departments = await prisma.department.findMany();
  if (departments.length === 0) {
    console.log("No departments found, creating default ones...");
    const depts = ["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "General Medicine", "Emergency"];
    for (const d of depts) {
      await prisma.department.create({ data: { name: d } });
    }
    departments = await prisma.department.findMany();
  }

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // 2. Create 20 Doctors and their Users
  const newDoctors = [];
  console.log("Creating 20 doctors...");
  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    
    // Create User first
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR"
      }
    });

    const dept = faker.helpers.arrayElement(departments);

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        name,
        specialization: faker.person.jobArea(),
        departmentId: dept.id,
        availability: "Mon-Fri 9AM-5PM",
      }
    });
    newDoctors.push(doctor);
  }

  // 3. Create 50 Patients and their Users
  const newPatients = [];
  console.log("Creating 50 patients...");
  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const phone = faker.phone.number();
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PATIENT"
      }
    });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        fullName: name,
        phone,
        icNumber: faker.string.numeric(12),
        gender: faker.helpers.arrayElement(["Male", "Female"]),
        dob: faker.date.birthdate({ min: 5, max: 85, mode: 'age' }),
        address: faker.location.streetAddress(),
        bloodType: faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
        allergies: faker.helpers.maybe(() => faker.lorem.words(3), { probability: 0.3 }),
        createdAt: faker.date.recent({ days: 60 })
      }
    });
    newPatients.push(patient);
  }

  // 4. Create Appointments, Medical Records, Invoices, Labs, Pharmacy
  console.log("Creating appointments, records, invoices, lab tests, and pharmacy orders...");
  
  // Create 150 appointments total
  for (let i = 0; i < 150; i++) {
    const isPast = faker.datatype.boolean(0.6); // 60% chance it's a past appointment
    const patient = faker.helpers.arrayElement(newPatients);
    const doctor = faker.helpers.arrayElement(newDoctors);
    
    let date;
    let status;
    
    if (isPast) {
      date = faker.date.recent({ days: 30 });
      status = faker.datatype.boolean(0.8) ? "COMPLETED" : "CANCELLED"; // 80% completed if past
    } else {
      date = faker.date.soon({ days: 14 });
      status = "SCHEDULED";
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        date: date,
        time: `${faker.number.int({ min: 9, max: 16 }).toString().padStart(2, '0')}:00`,
        reason: faker.lorem.sentence(),
        status: status,
      }
    });

    // If completed, add Medical Record and Invoice
    if (status === "COMPLETED") {
      await prisma.medicalRecord.create({
        data: {
          appointmentId: appointment.id,
          diagnosis: faker.lorem.sentence(),
          prescription: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.7 }),
          notes: faker.lorem.paragraph(),
        }
      });

      const hasPaid = faker.datatype.boolean(0.8); // 80% paid invoices
      await prisma.invoice.create({
        data: {
          appointmentId: appointment.id,
          amount: faker.number.int({ min: 50, max: 300 }),
          status: hasPaid ? "PAID" : "UNPAID",
          createdAt: date
        }
      });
      
      // Randomly add a lab test
      if (faker.datatype.boolean(0.3)) {
        await prisma.labTest.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            testName: faker.helpers.arrayElement(["Blood Test", "X-Ray", "MRI", "Urine Analysis", "Lipid Panel", "ECG"]),
            status: faker.datatype.boolean(0.8) ? "COMPLETED" : "PENDING",
            result: faker.helpers.maybe(() => faker.lorem.words(3), { probability: 0.8 }),
            createdAt: date
          }
        });
      }

      // Randomly add pharmacy order
      if (faker.datatype.boolean(0.4)) {
        await prisma.pharmacyOrder.create({
          data: {
            patientId: patient.id,
            doctorId: doctor.id,
            medication: faker.helpers.arrayElement(["Paracetamol", "Ibuprofen", "Amoxicillin", "Lisinopril", "Metformin", "Atorvastatin"]),
            dosage: faker.helpers.arrayElement(["1 tab twice a day", "2 tabs daily", "1 tab after meals"]),
            status: faker.datatype.boolean(0.7) ? "DISPENSED" : "PENDING",
            createdAt: date
          }
        });
      }
    }
  }

  console.log("Database massively seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

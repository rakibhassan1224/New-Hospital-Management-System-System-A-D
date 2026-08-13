const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Lab Tests and Pharmacy Orders...");

  const patients = await prisma.patient.findMany({ take: 5 });
  const doctors = await prisma.doctor.findMany({ take: 3 });

  if (patients.length === 0 || doctors.length === 0) {
    console.error("Not enough patients or doctors found to seed data.");
    return;
  }

  // Lab Tests
  const labTests = [
    { testName: "Complete Blood Count (CBC)", status: "COMPLETED", result: "Normal" },
    { testName: "Lipid Panel", status: "COMPLETED", result: "High Cholesterol" },
    { testName: "HbA1c (Diabetes Test)", status: "PENDING", result: null },
    { testName: "Thyroid Function Test", status: "PENDING", result: null },
    { testName: "Liver Function Test", status: "COMPLETED", result: "Elevated ALT" },
    { testName: "Basic Metabolic Panel (BMP)", status: "COMPLETED", result: "Normal" },
    { testName: "Urinalysis", status: "PENDING", result: null },
    { testName: "COVID-19 PCR", status: "COMPLETED", result: "Negative" },
  ];

  for (let i = 0; i < labTests.length; i++) {
    const patient = patients[i % patients.length];
    const doctor = doctors[i % doctors.length];
    const test = labTests[i];

    await prisma.labTest.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        testName: test.testName,
        status: test.status,
        result: test.result,
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) // random date in last 10 days
      }
    });
  }

  // Pharmacy Orders
  const pharmacyOrders = [
    { medication: "Amoxicillin 500mg", dosage: "1 cap, 3 times a day", status: "DISPENSED" },
    { medication: "Lisinopril 10mg", dosage: "1 tab daily", status: "DISPENSED" },
    { medication: "Metformin 500mg", dosage: "1 tab twice daily with meals", status: "PENDING" },
    { medication: "Atorvastatin 20mg", dosage: "1 tab at bedtime", status: "DISPENSED" },
    { medication: "Levothyroxine 50mcg", dosage: "1 tab daily in the morning", status: "PENDING" },
    { medication: "Omeprazole 20mg", dosage: "1 cap daily before breakfast", status: "DISPENSED" },
    { medication: "Amlodipine 5mg", dosage: "1 tab daily", status: "PENDING" },
    { medication: "Sertraline 50mg", dosage: "1 tab daily", status: "DISPENSED" },
  ];

  for (let i = 0; i < pharmacyOrders.length; i++) {
    const patient = patients[(i + 1) % patients.length]; // shifted to mix it up
    const doctor = doctors[(i + 1) % doctors.length];
    const order = pharmacyOrders[i];

    await prisma.pharmacyOrder.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        medication: order.medication,
        dosage: order.dosage,
        status: order.status,
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log("Successfully seeded Lab Tests and Pharmacy Orders!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

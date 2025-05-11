import { faker } from "@faker-js/faker";
import { db } from "../index";
import { users } from "../schema/user";
import { companies } from "../schema/company";
import { jobSeekers } from "../schema/jobSeeker";
import { jobs } from "../schema/job";
import { applications } from "../schema/application";
import { jobQuestions } from "../schema/jobQuestion";
import { savedJobs } from "../schema/savedJob";
import { hash } from "bcryptjs";

// Helper function to generate a phone number within 20 characters
function generatePhoneNumber() {
    return faker.phone.number({ style: "national" }); // This will generate numbers like (234) 567-8901
}

async function seed() {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await db.delete(applications);
    await db.delete(jobs);
    await db.delete(jobSeekers);
    await db.delete(companies);
    await db.delete(users);

    // Create users (both job seekers and companies)
    const userCount = 20;
    const createdUsers = [];

    for (let i = 0; i < userCount; i++) {
        const isCompany = i % 2 === 0;
        const user = await db
            .insert(users)
            .values({
                email: faker.internet.email(),
                password: await hash("password123", 10),
                role: isCompany ? "company" : "jobseeker",
                profileCompleted: true,
            })
            .returning();
        createdUsers.push(user[0]);
    }

    // Create companies
    const companyUsers = createdUsers.filter((user) => user.role === "company");
    const createdCompanies = [];

    for (const user of companyUsers) {
        const company = await db
            .insert(companies)
            .values({
                userId: user.id,
                name: faker.company.name(),
                location: faker.location.city(),
                phone: generatePhoneNumber(),
                industry: faker.helpers.arrayElement([
                    "TECH",
                    "AGRI",
                    "HEALTH",
                    "FINANCE",
                    "EDUCATION",
                    "OTHER",
                ]),
                description: faker.company.catchPhrase(),
                registrationDate: faker.date.past().toISOString().split("T")[0],
            })
            .returning();
        createdCompanies.push(company[0]);
    }

    // Create job seekers
    const jobSeekerUsers = createdUsers.filter(
        (user) => user.role === "jobseeker"
    );
    const createdJobSeekers = [];

    for (const user of jobSeekerUsers) {
        const jobSeeker = await db
            .insert(jobSeekers)
            .values({
                userId: user.id,
                name: faker.person.fullName(),
                address: faker.location.streetAddress(),
                gender: faker.helpers.arrayElement(["Male", "Female", "Other"]),
                mobile: generatePhoneNumber(),
                description: faker.person.bio(),
                preferredJobType: faker.helpers.arrayElement([
                    "REMOTE",
                    "ONSITE",
                    "HYBRID",
                ]),
                availableSchedule: {
                    monday: { start: "09:00", end: "17:00" },
                    tuesday: { start: "09:00", end: "17:00" },
                    wednesday: { start: "09:00", end: "17:00" },
                    thursday: { start: "09:00", end: "17:00" },
                    friday: { start: "09:00", end: "17:00" },
                },
                currentlyLookingForJob: faker.datatype.boolean(),
            })
            .returning();
        createdJobSeekers.push(jobSeeker[0]);
    }

    // Create jobs
    const createdJobs = [];
    for (const company of createdCompanies) {
        const jobCount = faker.number.int({ min: 1, max: 5 });
        for (let i = 0; i < jobCount; i++) {
            const job = await db
                .insert(jobs)
                .values({
                    companyId: company.userId,
                    title: faker.person.jobTitle(),
                    description: faker.lorem.paragraphs(2),
                    location: faker.location.city(),
                    salaryMin: faker.number.int({ min: 30000, max: 60000 }),
                    salaryMax: faker.number.int({ min: 60000, max: 150000 }),
                    jobType: faker.helpers.arrayElement([
                        "REMOTE",
                        "ONSITE",
                        "HYBRID",
                    ]),
                    jobContractType: faker.helpers.arrayElement([
                        "PART_TIME",
                        "CONTRACT",
                    ]),
                    experienceLevel: faker.helpers.arrayElement([
                        "ENTRY",
                        "MID",
                        "SENIOR",
                    ]),
                    minimumWeeklyHourCommitment: faker.number.int({
                        min: 20,
                        max: 40,
                    }),
                    requiredSkills: Array.from(
                        { length: faker.number.int({ min: 3, max: 8 }) },
                        () =>
                            faker.helpers.arrayElement([
                                "JavaScript",
                                "TypeScript",
                                "React",
                                "Node.js",
                                "Python",
                                "Java",
                                "SQL",
                                "AWS",
                                "Docker",
                                "Kubernetes",
                                "GraphQL",
                                "REST API",
                            ])
                    ),
                    isUrgent: faker.datatype.boolean(),
                    isActive: faker.datatype.boolean(),
                })
                .returning();
            createdJobs.push(job[0]);
        }
    }

    // Create applications
    for (const job of createdJobs) {
        const applicationCount = faker.number.int({ min: 0, max: 5 });
        for (let i = 0; i < applicationCount; i++) {
            const jobSeeker = faker.helpers.arrayElement(createdJobSeekers);
            await db.insert(applications).values({
                jobId: job.id,
                jobSeekerId: jobSeeker.userId,
                status: faker.helpers.arrayElement([
                    "PENDING",
                    "REVIEWED",
                    "INTERVIEWING",
                    "OFFERED",
                    "REJECTED",
                    "WITHDRAWN",
                ]),
                coverLetter: faker.lorem.paragraphs(2),
            });
        }
    }

    // Create job questions
    for (const job of createdJobs) {
        const questionCount = faker.number.int({ min: 0, max: 3 });
        for (let i = 0; i < questionCount; i++) {
            const jobSeeker = faker.helpers.arrayElement(createdJobSeekers);
            await db.insert(jobQuestions).values({
                jobId: job.id,
                jobSeekerId: jobSeeker.userId,
                question: faker.lorem.sentence() + "?",
                answer: faker.datatype.boolean()
                    ? faker.lorem.paragraph()
                    : null,
                isAnswered: faker.datatype.boolean(),
            });
        }
    }

    // Create saved jobs
    for (const jobSeeker of createdJobSeekers) {
        const savedJobCount = faker.number.int({ min: 0, max: 5 });
        const randomJobs = faker.helpers.arrayElements(
            createdJobs,
            savedJobCount
        );
        for (const job of randomJobs) {
            await db.insert(savedJobs).values({
                jobId: job.id,
                jobSeekerId: jobSeeker.userId,
            });
        }
    }

    console.log("✅ Seeding completed!");
}

seed().catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
});

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

    // Create specific user account for both company and jobseeker
    const specificCompanyUser = await db
        .insert(users)
        .values({
            email: "company@company.com",
            password: await hash("company@company.com", 10),
            role: "company", // We'll create a separate user for jobseeker role
            profileCompleted: true,
        })
        .returning();

    // Create company profile for the specific user
    const specificCompany = await db
        .insert(companies)
        .values({
            userId: specificCompanyUser[0].id,
            name: "Test Company",
            location: "San Francisco",
            phone: generatePhoneNumber(),
            industry: "TECH",
            description: "A leading technology company",
            registrationDate: new Date().toISOString().split("T")[0],
        })
        .returning();

    // Create a separate user for jobseeker role with same credentials
    const specificJobSeekerUser = await db
        .insert(users)
        .values({
            email: "jobseeker@jobseeker.com",
            password: await hash("jobseeker@jobseeker.com", 10),
            role: "jobseeker",
            profileCompleted: true,
        })
        .returning();

    // Create jobseeker profile for the specific user
    const specificJobSeeker = await db
        .insert(jobSeekers)
        .values({
            userId: specificJobSeekerUser[0].id,
            name: "John Doe",
            address: "123 Main St, San Francisco",
            gender: "Male",
            mobile: generatePhoneNumber(),
            description: "Experienced software developer",
            preferredJobType: "HYBRID",
            availableSchedule: {
                saturday: { start: "09:00", end: "17:00" },
                sunday: { start: "09:00", end: "17:00" },
                monday: { start: "09:00", end: "17:00" },
                tuesday: { start: "09:00", end: "17:00" },
                wednesday: { start: "09:00", end: "17:00" },
                thursday: { start: "09:00", end: "17:00" },
                friday: { start: "09:00", end: "17:00" },
            },
            skills: "TypeScript, React, Node.js, AWS, GraphQL",
            currentlyLookingForJob: true,
            openToUrgentJobs: true,
            lastMinuteAvailability: true,
        })
        .returning();

    // Create specific job listings for the company
    const specificJobs = await Promise.all([
        db.insert(jobs).values({
            companyId: specificCompanyUser[0].id,
            title: "Senior Full Stack Developer",
            description: "Looking for an experienced full stack developer to join our team. Must have experience with React, Node.js, and TypeScript.",
            location: "San Francisco",
            salaryMin: 120000,
            salaryMax: 180000,
            jobType: "HYBRID",
            jobContractType: "PART_TIME",
            experienceLevel: "SENIOR",
            minimumWeeklyHourCommitment: 40,
            requiredSkills: ["TypeScript", "React", "Node.js", "AWS", "GraphQL"],
            isUrgent: true,
            isActive: true,
        }).returning(),
        db.insert(jobs).values({
            companyId: specificCompanyUser[0].id,
            title: "Frontend Developer",
            description: "Join our team as a frontend developer. We're looking for someone passionate about creating beautiful user interfaces.",
            location: "Remote",
            salaryMin: 90000,
            salaryMax: 130000,
            jobType: "REMOTE",
            jobContractType: "PART_TIME",
            experienceLevel: "MID",
            minimumWeeklyHourCommitment: 40,
            requiredSkills: ["JavaScript", "React", "TypeScript", "Tailwind CSS"],
            isUrgent: false,
            isActive: true,
        }).returning(),
        db.insert(jobs).values({
            companyId: specificCompanyUser[0].id,
            title: "DevOps Engineer",
            description: "Looking for a DevOps engineer to help us scale our infrastructure and improve our deployment processes.",
            location: "San Francisco",
            salaryMin: 130000,
            salaryMax: 190000,
            jobType: "HYBRID",
            jobContractType: "PART_TIME",
            experienceLevel: "SENIOR",
            minimumWeeklyHourCommitment: 40,
            requiredSkills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
            isUrgent: true,
            isActive: true,
        }).returning(),
    ]);

    // Create applications for the specific jobseeker
    await Promise.all([
        // Apply to the Senior Full Stack position
        db.insert(applications).values({
            jobId: specificJobs[0][0].id,
            jobSeekerId: specificJobSeekerUser[0].id,
            status: "INTERVIEWING",
            coverLetter: "I am excited to apply for the Senior Full Stack Developer position. With my 5+ years of experience in React, Node.js, and TypeScript, I believe I would be a great fit for your team.",
        }),
        // Apply to the Frontend Developer position
        db.insert(applications).values({
            jobId: specificJobs[1][0].id,
            jobSeekerId: specificJobSeekerUser[0].id,
            status: "PENDING",
            coverLetter: "I am writing to express my interest in the Frontend Developer position. I have extensive experience with React and TypeScript, and I am particularly drawn to your company's focus on user experience.",
        }),
        // Apply to the DevOps position
        db.insert(applications).values({
            jobId: specificJobs[2][0].id,
            jobSeekerId: specificJobSeekerUser[0].id,
            status: "REVIEWED",
            coverLetter: "While my primary experience is in frontend development, I have been working extensively with AWS and Docker in my current role. I am eager to transition into a DevOps role and believe I can bring valuable perspective to your team.",
        }),
    ]);

    // Create some job questions for the specific jobs
    await Promise.all([
        db.insert(jobQuestions).values({
            jobId: specificJobs[0][0].id,
            jobSeekerId: specificJobSeekerUser[0].id,
            question: "What is your experience with microservices architecture?",
            answer: "I have worked with microservices for the past 3 years, primarily using Node.js and Docker. I've helped design and implement several microservices that handle user authentication, payment processing, and real-time notifications.",
            isAnswered: true,
        }),
        db.insert(jobQuestions).values({
            jobId: specificJobs[1][0].id,
            jobSeekerId: specificJobSeekerUser[0].id,
            question: "Can you describe your experience with state management in React applications?",
            answer: "I have extensive experience with various state management solutions including Redux, Zustand, and React Query. I prefer using React Query for server state and Zustand for client state due to their simplicity and performance.",
            isAnswered: true,
        }),
    ]);

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

    const commonSkills = [
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
    ];

    for (const user of jobSeekerUsers) {
        // Generate random skills (2-5 skills per job seeker)
        const numSkills = faker.number.int({ min: 2, max: 5 });
        const selectedSkills = faker.helpers.arrayElements(commonSkills, numSkills);
        
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
                    saturday: { start: "09:00", end: "17:00" },
                    sunday: { start: "09:00", end: "17:00" },
                    monday: { start: "09:00", end: "17:00" },
                    tuesday: { start: "09:00", end: "17:00" },
                    wednesday: { start: "09:00", end: "17:00" },
                    thursday: { start: "09:00", end: "17:00" },
                    friday: { start: "09:00", end: "17:00" },
                },
                skills: selectedSkills.join(", "),
                currentlyLookingForJob: faker.datatype.boolean(),
                openToUrgentJobs: faker.datatype.boolean(),
                lastMinuteAvailability: faker.datatype.boolean(),
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

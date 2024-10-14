import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const alfred = await prisma.user.upsert({
    where: { email: "alfred@example.com" },
    update: {},
    create: {
      email: "alfred@example.com",
      name: "Alfred",
    },
  });

  console.log(alfred);

  const teacher = await prisma.teacher.upsert({
    where: { userId: alfred.id },
    update: {},
    create: {
      userId: alfred.id,
    },
  });

  console.log(teacher);

  const klass = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Code-101",
      teacherId: teacher.id,
    },
  });

  console.log(klass);

  const assignment = await prisma.assignment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "First Programming Homework",
      description: "Import a simple Scratch program!",
    },
  });

  console.log(assignment);

  const classAssignment = await prisma.classAssignment.upsert({
    where: {
      classId_assignmentId: { classId: klass.id, assignmentId: assignment.id },
    },
    update: {},
    create: {
      classId: klass.id,
      assignmentId: assignment.id,
    },
  });

  console.log(classAssignment);

  await Promise.all(
    ["bob", "charlie"]
      .map(async (name) => {
        const email = `${name}@example.com`;
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { name, email },
        });

        console.log(user);
        return user;
      })
      .map(async (u) => {
        const user = await u;

        const student = await prisma.student.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });

        console.log(student);

        const enrollment = await prisma.classEnrollment.upsert({
          where: {
            classId_studentId: { studentId: student.id, classId: klass.id },
          },
          update: {},
          create: {
            studentId: student.id,
            classId: klass.id,
          },
        });

        console.log(enrollment);

        return student.id;
      })
      .map(async (student) => {
        const studentId = await student;

        const submission = await prisma.submission.upsert({
          where: {
            // This is a hack to make sure we have 1 submission per student
            id: studentId,
          },
          update: {},
          create: {
            studentId,
            assignmentId: assignment.id,
            classId: klass.id,
            rawContent: `Some text file here from student ${studentId}!`,
          },
        });

        console.log(submission);
      }),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

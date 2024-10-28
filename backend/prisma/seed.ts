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

  const teacher = await prisma.teacher.upsert({
    where: { userId: alfred.id },
    update: {},
    create: {
      userId: alfred.id,
    },
  });

  console.log(["teacher", alfred, teacher]);

  const klass = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Code-101",
      teacherId: teacher.id,
    },
  });

  console.log(["class", klass]);

  const task = await prisma.task.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "First Programming Homework",
      description: "Import a simple Scratch program!",
    },
  });

  const sessionTask = await prisma.sessionTask.upsert({
    where: {
      classId_taskId: { classId: klass.id, taskId: task.id },
    },
    update: {},
    create: {
      classId: klass.id,
      taskId: task.id,
    },
  });

  console.log(["task", task, sessionTask]);

  await Promise.all(
    ["bob", "charlie"]
      .map(async (name) => {
        const email = `${name}@example.com`;
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { name, email },
        });

        return user;
      })
      .map(async (u) => {
        const user = await u;

        const student = await prisma.student.upsert({
          where: { userId: user.id },
          update: {},
          create: { userId: user.id },
        });

        console.log(["student", user, student]);

        const enrollment = await prisma.sessionEnrollment.upsert({
          where: {
            classId_studentId: { studentId: student.id, classId: klass.id },
          },
          update: {},
          create: {
            studentId: student.id,
            classId: klass.id,
          },
        });

        console.log(["enrollment", enrollment]);

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
            taskId: task.id,
            classId: klass.id,
            rawContent: `Some text file here from student ${studentId}!`,
          },
        });

        console.log(["submission", submission]);
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

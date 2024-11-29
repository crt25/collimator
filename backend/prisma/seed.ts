import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const teacher = await prisma.user.upsert({
    where: { email: "alfred@example.com" },
    update: {},
    create: {
      email: "alfred@example.com",
      name: "Alfred",
      type: "TEACHER",
    },
  });

  console.log(["teacher", teacher]);

  const klass = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "Class 1A // 2024-2025",
      teacherId: teacher.id,
    },
  });

  console.log(["class", klass]);

  const task = await prisma.task.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "A Programming Homework",
      description: "Import a simple Scratch program!",
      type: "SCRATCH",
      data: Buffer.from("VGhpcyBpcyBhIHNpbXBsZSB0ZXh0Cg==", "base64"),
      mimeType: "text/plain",
    },
  });

  const session = await prisma.session.upsert({
    where: { id: 1 },
    update: {},
    create: {
      classId: klass.id,
      title: "First session",
      description: "This is the first session",
    },
  });

  const sessionTask = await prisma.sessionTask.upsert({
    where: {
      sessionId_taskId: { sessionId: session.id, taskId: task.id },
    },
    update: {},
    create: {
      sessionId: session.id,
      taskId: task.id,
      index: 0,
    },
  });

  console.log(["task", task, sessionTask]);

  await Promise.all(
    ["bob", "charlie"].map(async (name, index) => {
      const student = await prisma.student.upsert({
        where: { id: name },
        update: {},
        create: { id: name, classId: klass.id },
      });

      console.log(["student", student]);

      const solution = await prisma.solution.upsert({
        // This is a hack to make sure we have 1 solution per student
        where: { id: index + 1 },
        update: {},
        create: {
          studentId: student.id,
          taskId: task.id,
          sessionId: session.id,
          data: Buffer.from(
            `Some text file here from student ${student.id}!`,
            "utf8",
          ),
          mimeType: "text/plain",
        },
      });

      const analysis = await prisma.solutionAnalysis.upsert({
        // Same hack as above, to create a solution
        where: { id: solution.id },
        update: {},
        create: {
          solutionId: solution.id,
          genericAst: '{"pure":"awesomeness"}',
        },
      });

      console.log(["solution", solution, analysis]);
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

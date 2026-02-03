import { defineMessages } from "react-intl";
import LessonList, { Lesson } from "@/components/lesson/LessonList";
import CrtNavigation from "@/components/CrtNavigation";
import PageLayout from "@/components/layout/PageLayout";

const lessons: Lesson[] = [
  {
    id: 1,
    name: "Lesson 1",
    tags: ["blue", "red", "green"],
    usedBy: ["2017a", "2020c", "2022d"],
  },
  {
    id: 2,
    name: "Lesson 2",
    tags: ["blue", "red", "green"],
    usedBy: ["2017a", "2017b", "2017c"],
  },
  {
    id: 3,
    name: "Lesson 3",
    tags: ["blue", "red"],
    usedBy: ["2017a", "2020a", "2022a"],
  },
  {
    id: 4,
    name: "Lesson 4",
    tags: ["blue"],
    usedBy: ["2017a", "2016c", "2016d"],
  },
  {
    id: 5,
    name: "Lesson 5",
    tags: ["green"],
    usedBy: ["2017a", "2020c", "2022d"],
  },
  {
    id: 6,
    name: "Lesson 6",
    tags: ["blue", "red", "green"],
    usedBy: ["2019a", "2020f", "2022a"],
  },
  {
    id: 7,
    name: "Lesson 7",
    tags: ["red", "green"],
    usedBy: ["2018a", "2020c", "2023d"],
  },
  {
    id: 8,
    name: "Lesson 8",
    tags: ["blue", "green"],
    usedBy: ["2017a", "2022d"],
  },
  {
    id: 9,
    name: "Lesson 9",
    tags: ["blue", "green"],
    usedBy: ["2017a", "2022d"],
  },
  {
    id: 10,
    name: "Lesson 10",
    tags: ["blue", "green"],
    usedBy: ["2017a", "2022d"],
  },
  {
    id: 11,
    name: "Lesson 11",
    tags: ["blue", "green"],
    usedBy: ["2017a", "2022d"],
  },
];

const messages = defineMessages({
  title: {
    id: "ListLessons.title",
    defaultMessage: "Lessons",
  },
  heading: {
    id: "ListLessons.header",
    defaultMessage: "Lesson Manager",
  },
});

const ListLessons = () => {
  return (
    <PageLayout
      title={messages.title}
      heading={messages.heading}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <LessonList
        fetchData={() =>
          Promise.resolve({ items: lessons, totalCount: lessons.length })
        }
      />
    </PageLayout>
  );
};

export default ListLessons;

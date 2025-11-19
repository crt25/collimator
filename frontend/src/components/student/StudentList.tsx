import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import { ColumnDef } from "@tanstack/react-table";
import { Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { ColumnType } from "@/types/tanstack-types";
import { StudentName } from "../encryption/StudentName";
import ChakraDataTable from "../ChakraDataTable";
import { EmptyState } from "../EmptyState";

const StudentListWrapper = styled.div`
  margin: 1rem 0;
`;

const messages = defineMessages({
  nameColumn: {
    id: "StudentList.columns.name",
    defaultMessage: "Name",
  },
  emptyStateTitle: {
    id: "StudentList.emptyState.title",
    defaultMessage: "There are no students yet.",
  },
});

type ClassStudentWithId = ClassStudent & { id: number };

const nameTemplate = (student: ClassStudentWithId) => {
  return (
    <Text
      fontWeight="semibold"
      fontSize="lg"
      data-testid={`student-${student.studentId}-name`}
      margin={0}
    >
      <StudentName
        studentId={student.studentId}
        pseudonym={student.pseudonym}
        keyPairId={student.keyPairId}
        testId={`student-${student.studentId}-name`}
      />
    </Text>
  );
};

const StudentList = ({ klass }: { klass: ExistingClassExtended }) => {
  const intl = useIntl();

  const columns: ColumnDef<ClassStudentWithId>[] = [
    {
      accessorKey: "pseudonym",
      header: intl.formatMessage(messages.nameColumn),
      cell: (info) => nameTemplate(info.row.original),
      meta: {
        columnType: ColumnType.text,
      },
    },
  ];

  const students = useMemo(
    () =>
      klass.students.map(
        (s) =>
          ({
            ...s,
            // the data table needs a unique id field
            id: s.studentId,
          }) satisfies ClassStudentWithId,
      ),
    [klass.students],
  );

  return (
    <StudentListWrapper data-testid="student-list">
      <ChakraDataTable
        data={students}
        columns={columns}
        features={{
          sorting: true,
        }}
        emptyStateElement={
          <EmptyState title={intl.formatMessage(messages.emptyStateTitle)} />
        }
      />
    </StudentListWrapper>
  );
};

export default StudentList;

import { Column } from "primereact/column";
import { defineMessages, useIntl } from "react-intl";
import styled from "@emotion/styled";
import DataTable from "@/components/DataTable";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { ClassStudent } from "@/api/collimator/models/classes/class-student";
import { StudentName } from "../encryption/StudentName";

const StudentListWrapper = styled.div`
  margin: 1rem 0;
`;

const messages = defineMessages({
  nameColumn: {
    id: "StudentList.columns.name",
    defaultMessage: "Name",
  },
});

const nameTemplate = (student: ClassStudent) => {
  return (
    <StudentName
      pseudonym={student.pseudonym}
      keyPairId={student.keyPairId}
      testId={`student-${student.id}-name`}
    />
  );
};

const StudentList = ({ klass }: { klass: ExistingClassExtended }) => {
  const intl = useIntl();

  return (
    <StudentListWrapper data-testid="student-list">
      <DataTable
        value={klass.students}
        lazy
        filterDisplay="row"
        dataKey="id"
        paginator
        rows={10}
      >
        <Column
          field="name"
          header={intl.formatMessage(messages.nameColumn)}
          body={nameTemplate}
        />
      </DataTable>
    </StudentListWrapper>
  );
};

export default StudentList;

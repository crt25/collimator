import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import SwrContent from "@/components/SwrContent";

const ClassDetail = () => {
  const router = useRouter();
  const { classId } = router.query as {
    classId: string;
  };

  const { data: klass, error, isLoading } = useClass(classId);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <ClassNavigation classId={klass?.id} />
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(klass) => (
            <div>
              <PageHeader>{klass.name}</PageHeader>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="ClassDetail.table.teacher"
                        defaultMessage="Teacher"
                      />
                    </td>
                    <td>{klass.teacher.name}</td>
                  </tr>
                  <tr>
                    <td>
                      <FormattedMessage
                        id="ClassDetail.table.numberOfStudents"
                        defaultMessage="Number of Students"
                      />
                    </td>
                    <td>{klass.studentCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default ClassDetail;

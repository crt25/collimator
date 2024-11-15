import { AuthenticatedTeacher } from "@/contexts/__tests__/decorators/authentication";
import StudentList from "./StudentList";
import { getClassesControllerFindOneV0ResponseMock } from "@/api/collimator/generated/endpoints/classes/classes.msw";
import { useContext, useState } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useEffect } from "@storybook/preview-api";
import { ExistingClassExtended } from "@/api/collimator/models/classes/existing-class-extended";
import { encodeBase64 } from "@/utilities/crypto/base64";
import ProgressSpinner from "../ProgressSpinner";
import { StudentIdentity } from "@/api/collimator/models/classes/class-student";

type Args = Omit<Parameters<typeof StudentList>[0], "klass">;

const originalKlass = getClassesControllerFindOneV0ResponseMock();

export default {
  decorators: [AuthenticatedTeacher],
  component: StudentList,
  title: "StudentList",
  render: (args: Args) => {
    const authContext = useContext(AuthenticationContext);

    const [klass, setKlass] = useState<ExistingClassExtended | null>(null);

    useEffect(() => {
      const encryptStudentNames = async () => {
        let students = originalKlass.students;

        if ("keyPair" in authContext) {
          students = await Promise.all(
            originalKlass.students.map(async (student) => {
              return {
                ...student,
                pseudonym: encodeBase64(
                  await authContext.keyPair.encryptString(
                    JSON.stringify({
                      longTermIdentity: student.pseudonym,
                      name: student.pseudonym,
                    } as StudentIdentity),
                  ),
                ),
              };
            }),
          );
        }

        setKlass({ ...originalKlass, students });
      };

      encryptStudentNames();
    }, [authContext]);

    if (!klass) {
      return <ProgressSpinner />;
    }

    return <StudentList {...args} klass={klass} />;
  },
};

export const Default = {
  args: {} as Args,
};

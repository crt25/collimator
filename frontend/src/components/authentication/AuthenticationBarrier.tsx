import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo } from "react";
import DisableSSR from "../next/DisableSSR";
import { UserRole } from "@/types/user/user-role";

const allowedRoutesForUnauthenticatedUsers = [
  "/_error",
  "/logout",
  "/login",
  "/login/oidc-redirect",
  "/login/admin",
  "/login/teacher",
  "/login/student",
  // this page has a special role in the process of student authentication
  // in particular, an ephemeral key pair is generated for the session
  // and the student's authentication is completed by communicating with the teacher
  "/class/[classId]/session/[sessionId]/join",
];
const allowedRoutesForStudents = [
  "/class/[classId]/session/[sessionId]/task/[taskId]/solve",
];

const AuthenticationBarrier = ({
  authenticationStateLoaded,
  children,
}: {
  authenticationStateLoaded: boolean;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const authenticationContext = useContext(AuthenticationContext);

  const isAuthenticated =
    authenticationContext.authenticationToken !== undefined;

  const isPublicPage = useMemo(
    () =>
      // either the route is allowed for unauthenticated users
      allowedRoutesForUnauthenticatedUsers.includes(router.pathname),
    [router.pathname],
  );

  const isStudentPage = useMemo(
    () => allowedRoutesForStudents.includes(router.pathname),
    [router.pathname],
  );

  const isAllowedToSeePage = useMemo(() => {
    return (
      // either the route is allowed for unauthenticated users
      isPublicPage ||
      // OR the user is authenticated
      (isAuthenticated &&
        // AND the page is allowed for students or the user is not a student
        (isStudentPage || authenticationContext.role !== UserRole.student))
    );
  }, [
    isAuthenticated,
    isPublicPage,
    authenticationContext.role,
    isStudentPage,
  ]);

  // redirect to login page if the user is not allowed to see the page
  // but only do so once the authentication state has been loaded
  useEffect(() => {
    if (authenticationStateLoaded && !isAllowedToSeePage) {
      router.replace("/login?redirectUri=" + router.asPath);
    }
  }, [authenticationStateLoaded, router, isAllowedToSeePage]);

  if (isPublicPage) {
    // SSR may be performed for public pages
    return children;
  }

  if (!isAllowedToSeePage) {
    return <DisableSSR />;
  }

  return <DisableSSR>{children}</DisableSSR>;
};

export default AuthenticationBarrier;

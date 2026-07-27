import { useRouter } from "next/router";
import { useContext, useEffect, useMemo } from "react";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
import { useAuthExpirationCheck } from "@/hooks/useAuthExpirationCheck";
import DisableSSR from "../next/DisableSSR";

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

// User management is admin-only: the navigation entry and the home-page card
// are already hidden from teachers, but the pages themselves were reachable by
// typing the URL, showing a teacher the whole User Manager and a Create User
// button that then fails with a 403.
const adminOnlyRoutes = ["/user", "/user/create", "/user/[userId]/detail"];

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

  // Hook to periodically check for authentication expiration
  useAuthExpirationCheck();

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

  const isAdminPage = useMemo(
    () => adminOnlyRoutes.includes(router.pathname),
    [router.pathname],
  );

  const isAllowedToSeePage = useMemo(() => {
    return (
      // either the route is allowed for unauthenticated users
      isPublicPage ||
      // OR the user is authenticated
      (isAuthenticated &&
        // AND the page is allowed for students or the user is not a student
        (isStudentPage || authenticationContext.role !== UserRole.student) &&
        // AND admin-only pages are restricted to admins
        (!isAdminPage || authenticationContext.role === UserRole.admin))
    );
  }, [
    isAuthenticated,
    isPublicPage,
    authenticationContext.role,
    isStudentPage,
    isAdminPage,
  ]);

  // redirect if the user is not allowed to see the page, but only once the
  // authentication state has been loaded. An authenticated non-admin on an
  // admin page is sent home rather than to the login page: signing in again
  // would not grant access and would just look like a broken login.
  useEffect(() => {
    if (authenticationStateLoaded && !isAllowedToSeePage) {
      router.replace(
        isAuthenticated && isAdminPage
          ? "/"
          : "/login?redirectUri=" + router.asPath,
      );
    }
  }, [
    authenticationStateLoaded,
    router,
    isAllowedToSeePage,
    isAuthenticated,
    isAdminPage,
  ]);

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

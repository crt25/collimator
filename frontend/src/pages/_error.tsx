import NextErrorComponent from "next/error";

// Presentational error page only. It intentionally has no getInitialProps so
// that `next export` does not warn about it. Reporting client-side render
// failures to Sentry is handled by the Sentry.ErrorBoundary in _app.tsx, which
// (unlike this component under static export) actually receives the error.
const CustomErrorComponent = ({ statusCode }: { statusCode?: number }) => (
  <NextErrorComponent statusCode={statusCode ?? 404} />
);

export default CustomErrorComponent;

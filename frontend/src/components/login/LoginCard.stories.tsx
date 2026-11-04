export default { component: LoginCard };
import LoginCard from "./LoginCard";

type Args = Parameters<typeof LoginCard>[0];

export const Default = {
  args: {
    title: <span>Welcome Back!</span>,
    description: <span>Please log in to continue.</span>,
    buttonLabel: <span>Log In</span>,
    onAuthenticate: () => alert("Authenticate clicked"),
    buttonDataTestId: "login-button",
  } as Args,
};

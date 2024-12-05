import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Solve from "./pages/Solve";
import ErrorPage from "./pages/ErrorPage";
import Edit from "./pages/Edit";
import Show from "./pages/Show";
import { Toaster } from "react-hot-toast";

export const basePath = "/scratch";

// Analogous to https://github.com/scratchfoundation/scratch-gui/blob/develop/src/playground/render-gui.jsx#L37

const appRoot = document.getElementById("root") as HTMLElement;

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <ErrorPage />,
      errorElement: <ErrorPage />,
    },
    {
      path: "solve",
      element: <Solve />,
    },
    {
      path: "edit",
      element: <Edit />,
    },
    {
      path: "show",
      element: <Show />,
    },
  ],
  {
    basename: basePath,
  },
);

ReactDOM.render(
  <>
    <RouterProvider router={router} />
    <Toaster />
  </>,
  appRoot,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

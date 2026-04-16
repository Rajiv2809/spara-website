import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./Layout/DefaultLayout.jsx";
import GuestLayout from "./Layout/GuestLayout.jsx";
import Login from "./Pages/Login.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {}
        ]
    },
    {
        path: "/",
        element: <GuestLayout />,
        children:[
            {
                path
            }
        ]
    }
]);

export default router;
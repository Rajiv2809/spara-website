import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./Layout/DefaultLayout.jsx";
import GuestLayout from "./Layout/GuestLayout.jsx";
import Login from "./Pages/Login.jsx";
import Home from "./Pages/Home.jsx";
const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/home",
                element: <Home />
            },
         
           
        ]
    },
    {
        path: "/",
        element: <GuestLayout />,
        children:[
            {
                path: "/login",
                element: <Login />
                
            },
        
        ]
    }
]);

export default router;
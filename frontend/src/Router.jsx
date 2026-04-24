import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./Layout/DefaultLayout.jsx";
import GuestLayout from "./Layout/GuestLayout.jsx";
import Login from "./Pages/Login.jsx";
import Home from "./Pages/Home.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import LandingPage from "./Pages/LandingPage.jsx";
const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        children: [
            {
                path: "/home",
                element: <Home />
            },
            {
                path: "/dashboard",
                element: <Dashboard/>
            }

         
           
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
            {
                path: "/landing-page",
                element: <LandingPage />
                
            },
        
        ]
    }
]);

export default router;
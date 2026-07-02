import React from 'react';
import { Outlet } from 'react-router-dom';
import { useStateContext } from '../Contexts/context';
import axiosClient from '../axios';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Toast from '../Components/Toast';
import Cookies from "js-cookie";

const DefaultLayout = () => {
    const { setToken, userToken, setCurrentUser, userToe, setLoading } = useStateContext();
   
    if (!userToken) {
        return <Navigate to="/login" />
    }
    useEffect(() => {
        const savedUser = Cookies.get("currentUser");
       
       

        axiosClient.get('/me')
           .then(({ data }) => {
               setCurrentUser(data.user);
           })
           .catch((error) => {
               console.log(error.response);
               setToken(null);
           })
           .finally(() => {
               setLoading(false);
           });
    }, []);

    return (
        <div >
            <Toast />
            <Outlet />
        </div>
    );
}

export default DefaultLayout;
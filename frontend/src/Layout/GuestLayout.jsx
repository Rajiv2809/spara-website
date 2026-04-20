import React from 'react';
import { Outlet } from 'react-router-dom';
import { useStateContext } from '../Contexts/context';
import { Navigate } from 'react-router-dom';
const GuestLayout = () => {
    const {userToken} = useStateContext();
     if(userToken){
        return <Navigate to="/home" />
    }
    return (
        <div>
            <Outlet />
        </div>
    );
}

export default GuestLayout;

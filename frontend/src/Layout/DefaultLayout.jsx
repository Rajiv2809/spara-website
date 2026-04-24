import  React  from 'react';
import { Outlet } from 'react-router-dom';
import { useStateContext } from '../Contexts/context';
import axiosClient from '../axios';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Toast from '../Components/Toast';

const DefaultLayout = () => {
    const {setToken, userToken, setCurrentUser, userToe} = useStateContext();
    
    if(!userToken){
        return <Navigate to="/login" />
    }
    useEffect(() => {
        axiosClient.get('/me')
        .then(({data}) => {
            setCurrentUser(data);
        })
        .catch(({res}) => {
            console.log(res);
            setToken(null)
        })

    },[])
    
    return (
        <div >
            <Toast/>
            <Outlet />
        </div>
    );
}

export default DefaultLayout;
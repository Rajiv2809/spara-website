import  React  from 'react';
import { Outlet } from 'react-router-dom';
import { useStateContext } from '../Contexts/context';
import axiosClient from '../axios';
import { useEffect } from 'react';

const DefaultLayout = () => {
    const {setToken, userToken, setCurrentUser} = useStateContext();
    
    useEffect(() => {
        axiosClient.get('/me')
        .then(({data}) => {
            console.log(data);
            
        })
        .catch(({res}) => {
            console.log(res);
            
            setToken(null)
        })
    })
    return (
        <div>
            
            <Outlet />
        </div>
    );
}

export default DefaultLayout;
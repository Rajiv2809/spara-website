import { createContext, useContext, useState } from "react";


const  StateContext = createContext({
    currentUser: {},
    userToken: null,
    Toast: {
        message: '',
        color: '',
        show: false,
    },
    loading: true,
    setLoading : () => {},
    setToken: () => {},
    setToast: () => {},
    setCurrentUser: () => {},
    setUserToken: () => {}
})

export const ContextProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState({});
    const [userToken, setUserToken] = useState(localStorage.getItem('accessToken'));
    const [toast, setToast] =useState({message:'', color:'', show:false})
    const [loading, setLoading] =useState(true)
    const setToken = (token) => {
        if(token){
            localStorage.setItem('accessToken', token)
        } else {
            localStorage.removeItem('accessToken')
        }
        setUserToken(token)
    }
    const showToast = (message, color) => {
        setToast({message:message, color:color, show:true})

        setTimeout(() => {
            setToast({message:'', color:'', show:false})
        }, 4000)
    }


    return (
        <StateContext.Provider
            value={{ 
                currentUser,
                userToken,
                toast,
                loading,
                setLoading,
                setCurrentUser,
                setUserToken,
                setToken,
                setToast,
                showToast
             }}
        
        >
            {children}
        </StateContext.Provider>
    ) 
        
    
}

export const useStateContext = () => useContext(StateContext);
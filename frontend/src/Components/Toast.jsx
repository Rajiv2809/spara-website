import React from 'react';
import { useStateContext } from '../Contexts/context.jsx';
const Toast = () => {
    const { toast } = useStateContext();
    return (
        <div>
        {toast.show && (
            <div className={`fixed ${toast.color === 'red' ? 'bg-red-800' : 'bg-green-800'} z-50 font-poppins top-[70px] right-4 text-white px-4 py-2 rounded-lg shadow-lg`}>
                {toast.message}
            </div>
        )}
        </div>
    );
}

export default Toast;

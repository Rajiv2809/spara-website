import React from 'react';
import { useStateContext } from '../Contexts/context.jsx';
const Toast = () => {
    const { toast } = useStateContext();
    return (
        <div>

        {toast.show && (
            <div className={`fixed ${toast.color === 'red' ? 'bg-red-500' : 'bg-green-500'} z-50 font-poppins top-[50px] right-4 text-white px-4 py-2 rounded-lg shadow-lg`}>
                {toast.message}
            </div>
        )}
        </div>
    );
}

export default Toast;

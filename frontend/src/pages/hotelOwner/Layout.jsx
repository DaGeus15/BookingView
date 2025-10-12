import React, { use, useEffect } from 'react'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Layout = () => {
    const {isOwner, navigate} = useAppContext();

    useEffect(() => {
        if (!isOwner) {
            navigate('/');
        }
    }, [isOwner]);


    return (
        <div className='flex flex-col h-screen'>
            <div className='flex h-full'>
                <Sidebar />
                <div className='flex-1 p-4 pt-[5rem] md:pt-[6rem] md:px-10 h-full'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout
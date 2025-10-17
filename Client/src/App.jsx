import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar'
import Footer from './Components/Footer'
import Home from './Pages/Home';
import Movies from './Pages/Movies';
import MovieDetails from './Pages/MovieDetails';
import SeatLayout from './Pages/SeatLayout';
import MyBookings from './Pages/MyBookings';
import Favourite from './Pages/Favourite';
import { Toaster } from 'react-hot-toast';
import Layout from './Pages/Admin/Layout';
import Dashboard from './Pages/Admin/Dashboard';
import AddShows from './Pages/Admin/AddShows';
import ListShows from './Pages/Admin/ListShows';
import ListBookings from './Pages/Admin/ListBookings';
import { useAppContext } from './Context/AppContext';
import { SignIn } from '@clerk/clerk-react';
import Loading from './Components/Loading';

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin');

  const {user} = useAppContext()
  return (
    <>
        <Toaster />    

        {!isAdminRoute && <Navbar/>}

        <Routes>
            <Route path='/' element={<Home/>} />  
            <Route path='/movies' element={<Movies/>} />  
            <Route path='/movies/:id' element={<MovieDetails/>} />  
            <Route path='/movies/:id/:date' element={<SeatLayout/>} />  
            <Route path='/my-bookings' element={<MyBookings/>} />  
            <Route path='/loading/:nextUrl' element={<Loading/>} />  
            <Route path='/favourite' element={<Favourite/>} />  

            <Route path='/admin/*' element={user ? <Layout/> : (
              <div className='min-h-screen flex justify-center items-center'>
                <SignIn fallbackRedirectUrl={'/admin'}/>
              </div>
            )}>
              <Route index element={<Dashboard/>}/>
              <Route path='add-shows' element={<AddShows/>}/>
              <Route path='list-shows' element={<ListShows/>}/>
              <Route path='list-bookings' element={<ListBookings/>}/>
            </Route>
        </Routes>

        {!isAdminRoute && <Footer/>}
    </>
  )
}

export default App

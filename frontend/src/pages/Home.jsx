import React from 'react'
import Hero from '../components/Hero'
import FeauteredDestination from '../components/FeauteredDestination'
import ExcusiveOffers from '../components/ExcusiveOffers'
import Testimonial from '../components/Testimonial'
import RecommendedHotels from '../components/RecommendedHotels'

const Home = () => {
  return (
    <>
      <Hero/>
      <RecommendedHotels/>
      <FeauteredDestination/>
    </>
  )
}

export default Home

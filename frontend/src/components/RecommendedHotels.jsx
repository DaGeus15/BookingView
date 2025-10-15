import React, { useState, useEffect, useCallback } from "react";
import HotelCard from "../components/HotelCard";
import Title from "./Title";
import { useAppContext } from "../hooks/useAppContext";
// import { set } from "date-fns";
// import { fi } from "date-fns/locale";

const RecommendedHotels = () => {
  const { rooms, searchedCities } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  const filterHotels = useCallback(() => {
    const filteredHotels = rooms.slice().filter(room => searchedCities.includes(room.hotel.city));
    setRecommended(filteredHotels);
  }, [rooms, searchedCities])

  useEffect(() => {

    filterHotels();
  }, [filterHotels, rooms, searchedCities]);

  return recommended.length > 0 && (
    <div className="flex flex-col items-center mt-10 px-6 md:px-16 lg:px-24 bg-slate-50">
      <Title
        title="Recommended Properties"
        subTitle="Discover our handpicked selection of exceptional properties, offering memorable stays and unique experiences."
      />

      <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index}></HotelCard>
        ))}
      </div>
    </div>
  );
};

export default RecommendedHotels;

import React from "react";
import HotelCard from "../components/HotelCard";
import Title from "./Title";
import { useAppContext } from "../hooks/useAppContext";

const FeauteredDestination = () => {
  const { rooms, navigate } = useAppContext();

  return (
    rooms?.length > 0 && (
      <div className="flex flex-col items-center mt-10 px-6 md:px-16 lg:px-24 bg-slate-50">
        <Title
          title="Featured Destination"
          subTitle="Discover our handpicked section of exceptional properties, offering unparalleled luxury and unforgettable experiences."
        />

        <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
          {rooms.slice(0, 4).map((room, index) => (
            <HotelCard key={room._id} room={room} index={index}></HotelCard>
          ))}
        </div>

        <button
          onClick={() => {
            navigate("/rooms");
            scrollTo(0, 0);
          }}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            View All Destinations
          </span>
        </button>
      </div>
    )
  );
};

export default FeauteredDestination;

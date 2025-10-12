import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { CardBody, CardContainer, CardItem } from "../components/3d-card";

const HotelCard = ({ room, index }) => {
  return (
    <CardContainer className="inter-var">
      <CardBody
        className="bg-white relative group/card hover:shadow-2xl hover:shadow-emerald-500/[0.1] 
        border border-gray-200 
        w-full sm:w-[25rem] h-auto rounded-xl  
        shadow-[0px_4px_4px_rgba(0,0,0,0.05)]"
      >
        <Link
          to={"/rooms/" + room._id}
          onClick={() => scrollTo(0, 0)}
          key={room._id}
          className="block"
        >
          {/* Imagen */}
          <CardItem translateZ="50" className="w-full">
            <img
              src={room.images[0]}
              alt={room.hotel.name}
              className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            />
          </CardItem>

          {/* Etiqueta Best Seller */}
          {index % 2 === 0 && (
            <p className="px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full shadow">
              Best Seller
            </p>
          )}

          {/* Contenido */}
          <div className="p-4 pt-5">
            <div className="flex items-center justify-between">
              <CardItem
                translateZ="70"
                className="font-playfair text-xl font-medium text-gray-800"
              >
                {room.hotel.name}
              </CardItem>
            </div>

            <div className="flex items-center gap-1 text-sm mt-1 text-gray-600">
              <img src={assets.locationIcon} alt="location-icon" />
              <span>{room.hotel.address}</span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p>
                <span className="text-xl text-gray-800">
                  ${room.pricePerNight}
                </span>{" "}
                / night
              </p>

              <CardItem
                translateZ={20}
                as="button"
                className="px-4 py-2 text-sm font-medium border border-gray-300 
                rounded bg-white text-gray-700 hover:bg-gray-50 
                transition-all cursor-pointer"
              >
                Book Now
              </CardItem>
            </div>
          </div>
        </Link>
      </CardBody>
    </CardContainer>
  );
};

export default HotelCard;

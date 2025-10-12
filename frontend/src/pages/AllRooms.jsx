import React, { use, useMemo, useState } from "react";
import { assets, facilityIcons, roomsDummyData } from "../assets/assets";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import NoRooms from "../components/No-rooms";
import { useAppContext } from "../context/AppContext";
import SearchBar from "../components/searchBar";

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};
const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={(e) => onChange(label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  );
};

const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, navigate, currency } = useAppContext();
  const location = useLocation();
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedSortOption, setSelectedSortOption] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  });
  const [selectedSort, setSelectedSort] = useState("");
  const guests = Number(searchParams.get("guests") || 1);
  const checkInStr = searchParams.get("checkIn");
  const checkOutStr = searchParams.get("checkOut");

  const checkIn = checkInStr ? new Date(checkInStr) : null;
  const checkOut = checkOutStr ? new Date(checkOutStr) : null;

  // Calcular cantidad de noches
  let nights = 1;
  if (checkIn && checkOut) {
    const diffTime = Math.abs(checkOut - checkIn);
    nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const roomTypes = ["Single Bed", "Double Bed", "Luxury Room", "Family Suite"];
  const priceRanges = [
    "0 to 500",
    "500 to 1000",
    "1000 to 2000",
    "2000 to 3000",
  ];
  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First",
  ];
  //Handle changes for filters ans sorting
  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };
      if (checked) {
        updatedFilters[type].push(value);
      } else {
        updatedFilters[type] = updatedFilters[type].filter(
          (item) => item !== value
        );
      }
      return updatedFilters;
    });
  };
  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
  };

  //Function to check if a room matches the selected room types
  const matchesRoomType = (room) => {
    return (
      selectedFilters.roomType.length === 0 ||
      selectedFilters.roomType.includes(room.roomType)
    );
  };

  //Function to check if a room matches the selected price ranges
  const matchesPriceRange = (room) => {
    return (
      selectedFilters.priceRange.length === 0 ||
      selectedFilters.priceRange.some((range) => {
        const [min, max] = range.split(" to ").map(Number);
        return room.pricePerNight >= min && room.pricePerNight <= max;
      })
    );
  };
  // Function to sort rooms based on the selected sort option
  const sortRooms = (a, b) => {
    if (selectedSort === "Price Low to High") {
      return a.pricePerNight - b.pricePerNight;
    } else if (selectedSort === "Price High to Low") {
      return b.pricePerNight - a.pricePerNight;
    } else if (selectedSort === "Newest First") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  };

  //Filter destination
  const filterDestination = (room) => {
    const destionation = searchParams.get("destination");
    if (!destionation) return true;
    return room.hotel.city.toLowerCase().includes(destionation.toLowerCase());
  };

  // Filter and sort rooms based on the selected filters and sort option
  const filteredRooms = useMemo(() => {
    return rooms
      .filter(
        (room) =>
          matchesRoomType(room) &&
          matchesPriceRange(room) &&
          filterDestination(room)
      )
      .sort(sortRooms);
  }, [rooms, selectedFilters, selectedSort, searchParams]);

  //Clear filters'
  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priceRange: [] });
    setSelectedSort("");
    setSearchParams({});
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Header */}
      <div>
        <div className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">Rooms</h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
            Enjoy a comfortable stay with exceptional service and thoughtful
            amenities designed to make your experience memorable.
          </p>
        </div>
        <SearchBar
          initialDestination={searchParams.get("destination") || ""}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialGuests={guests}
        />
        {filteredRooms.length === 0 ? (
          <NoRooms />
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room._id}
              className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0"
            >
              {/* Room Image */}
              <img
                onClick={() => {
                  navigate({
                    pathname: `/rooms/${room._id}`,
                    search: location.search,
                  });
                  scrollTo(0, 0);
                }}
                src={room.images[0]}
                alt="room-img"
                title="View Room Details"
                className="max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer"
              />

              {/* Room Info */}
              <div className="md:w-1/2 flex flex-col gap-2">
                <p className="text-gray-800">{room.hotel.city}</p>
                <p
                  onClick={() => {
                    navigate({
                      pathname: `/rooms/${room._id}`,
                      search: location.search,
                    });
                    scrollTo(0, 0);
                  }}
                  className="text-gray-800 text-3xl font-playfair cursor-pointer"
                >
                  {room.hotel.name}
                </p>

                <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
                  <img src={assets.locationIcon} alt="location-icon" />
                  <span>{room.hotel.address}</span>
                </div>

                {/* Room Amenities */}
                <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                  {room.amenities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
                    >
                      <img
                        src={facilityIcons[item]}
                        alt={item}
                        className="w-5 h-5"
                      />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>

                {/* Room Price per Night */}
                <p className="text-xl font-medium text-gray-700">
                  ${room.pricePerNight * nights * guests} total ({guests} guest
                  {guests > 1 ? "s" : ""} • {nights} night
                  {nights > 1 ? "s" : ""})
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filters */}

      <div className="w-80 p-6 border border-gray-300 rounded-lg shadow-md bg-white text-gray-600 max-lg:mb-8 min-lg:mt-16">
        <div
          className={`flex items-center justify-between px-5 py-2.5 min-lg:border-gray-300 ${
            openFilters && "border-b"
          }`}
        >
          <p className="text-base font-medium text-gray-800">FILTERS</p>
          <span
            onClick={() => setOpenFilters(!openFilters)}
            className="lg:hidden cursor-pointer"
          >
            {openFilters ? "HIDE" : "SHOW"}
          </span>
          <span
            className="hidden lg:block cursor-pointer hover:animate-pop"
            onClick={clearFilters}
          >
            CLEAR
          </span>
        </div>
        {/* controles de filtro */}
        <div
          className={`${
            openFilters ? "h-auto" : "h-0 lg:h-auto"
          } overflow-hidden transition-all duration-700`}
        >
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Popular filters</p>
            {roomTypes.map((room, index) => (
              <CheckBox
                key={index}
                label={room}
                selected={selectedFilters.roomType.includes(room)}
                onChange={(checked) =>
                  handleFilterChange(checked, room, "roomType")
                }
              />
            ))}
          </div>

          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox
                key={index}
                label={`${currency} ${range}`}
                selected={selectedFilters.priceRange.includes(range)}
                onChange={(checked) =>
                  handleFilterChange(checked, range, "priceRange")
                }
              />
            ))}
          </div>

          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={() => handleSortChange(option)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRooms;

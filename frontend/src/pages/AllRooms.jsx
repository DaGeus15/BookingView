import React, { useCallback, useMemo, useState } from "react";
import { assets, facilityIcons } from "../assets/assets";
import { useLocation, useSearchParams } from "react-router-dom";
import NoRooms from "../components/No-rooms";
import { useAppContext } from "../hooks/useAppContext";
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
        onChange={() => onChange(label)}
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
  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  });
  const [selectedSort, setSelectedSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 5;

  const guests = Number(searchParams.get("guests") || 1);

  const parseDate = (str) => {
    if (!str) return null;
    const [year, month, day] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const checkIn = parseDate(searchParams.get("checkIn"));
  const checkOut = parseDate(searchParams.get("checkOut"));

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
    "3000+",
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
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  //Function to check if a room matches the selected room types
  const matchesRoomType = useCallback(
    (room) => {
      return (
        selectedFilters.roomType.length === 0 ||
        selectedFilters.roomType.includes(room.roomType)
      );
    },
    [selectedFilters.roomType]
  );

  //Function to check if a room matches the selected price ranges
  const matchesPriceRange = useCallback(
    (room) => {
      const totalPrice = room.pricePerNight * nights * guests;

      return (
        selectedFilters.priceRange.length === 0 ||
        selectedFilters.priceRange.some((range) => {
          if (range.includes("+")) {
            const min = Number(range.replace("+", ""));
            return totalPrice >= min;
          } else {
            const [min, max] = range.split(" to ").map(Number);
            return totalPrice >= min && totalPrice <= max;
          }
        })
      );
    },
    [guests, nights, selectedFilters.priceRange]
  );

  // Function to sort rooms based on the selected sort option
  const sortRooms = useCallback(
    (a, b) => {
      if (selectedSort === "Price Low to High") {
        return a.pricePerNight - b.pricePerNight;
      } else if (selectedSort === "Price High to Low") {
        return b.pricePerNight - a.pricePerNight;
      } else if (selectedSort === "Newest First") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    },
    [selectedSort]
  );

  //Filter destination
  const filterDestination = useCallback(
    (room) => {
      const destionation = searchParams.get("destination");
      if (!destionation) return true;
      return room.hotel.city.toLowerCase().includes(destionation.toLowerCase());
    },
    [searchParams]
  );

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
  }, [rooms, sortRooms, matchesRoomType, matchesPriceRange, filterDestination]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  //Clear filters'
  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priceRange: [] });
    setSelectedSort("");
    setSearchParams({});
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Header */}
      <div className="flex-1 w-full">
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

        {/* Results count */}
        {filteredRooms.length > 0 && (
          <p className="text-sm text-gray-600 mt-4">
            Showing {indexOfFirstRoom + 1}-
            {Math.min(indexOfLastRoom, filteredRooms.length)} of{" "}
            {filteredRooms.length} rooms
          </p>
        )}

        {filteredRooms.length === 0 ? (
          <NoRooms />
        ) : (
          <>
            {currentRooms.map((room) => (
              <div
                key={room._id}
                className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:border-0"
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
                    ${room.pricePerNight * nights * guests} total ({guests}{" "}
                    guest
                    {guests > 1 ? "s" : ""} • {nights} night
                    {nights > 1 ? "s" : ""})
                  </p>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 mb-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-4 py-2 border rounded-lg transition-all ${
                          currentPage === pageNumber
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber}>...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
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

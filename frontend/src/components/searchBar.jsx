import React, { useState, useRef, useEffect } from "react";
import { assets, cities } from "../assets/assets";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useAppContext } from "../hooks/useAppContext";
// import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SearchBar = ({
  initialDestination = "",
  initialCheckIn = null,
  initialCheckOut = null,
  initialGuests = 1,
}) => {
  const [form, setForm] = useState({
    destination: initialDestination,
    guests: initialGuests,
  });

  const [dateRange, setDateRange] = useState([
    {
      startDate: initialCheckIn,
      endDate: initialCheckOut,
      key: "selection",
    },
  ]);
  const { axios, getToken, setSearchedCities } = useAppContext();
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const { destination, guests } = form;

    const checkIn = dateRange[0].startDate
      ? dateRange[0].startDate.toISOString().split("T")[0]
      : "";
    const checkOut = dateRange[0].endDate
      ? dateRange[0].endDate.toISOString().split("T")[0]
      : "";

    const destParam = destination === "All" ? "" : destination;

    navigate(
      `/rooms?destination=${destParam}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );

    if (destination !== "All") {
      try {
        await axios.post(
          "/api/user/store-recent-search",
          { recentSearchedCity: destination },
          { headers: { Authorization: `Bearer ${await getToken()}` } }
        );
      } catch (error) {
        console.error("Error guardando ciudad reciente:", error);
      }

      setSearchedCities((prev) => {
        const updated = [...prev, destination];
        if (updated.length > 3) updated.shift();
        return updated;
      });
    }
  };

  const handleClearFilters = () => {
    setForm({ destination: "All", guests: 1 });
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    navigate("/rooms");
  };

  return (
    <form
      className="bg-white text-gray-500 rounded-lg px-6 py-4 flex flex-col md:flex-row max-md:items-start gap-4 mt-6"
      onSubmit={handleSearch}
    >
      {/* Destination */}
      <div>
        <div className="flex items-center gap-2">
          <img src={assets.locationIcon} alt="" className="h-4" />
          <label htmlFor="destination">Destination</label>
        </div>
        <select
          id="destination"
          className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none w-full"
          value={form.destination}
          onChange={handleChange}
        >
          <option value="All">All Cities</option>
          {cities.map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <img src={assets.calenderIcon} alt="" className="h-4" />
          <label>Dates</label>
        </div>
        <input
          type="text"
          readOnly
          value={
            dateRange[0].startDate && dateRange[0].endDate
              ? `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
              : "Select dates"
          }
          className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none cursor-pointer"
          onClick={() => setShowCalendar((prev) => !prev)}
        />
        {showCalendar && (
          <div
            ref={calendarRef}
            className="absolute z-50 mt-2 left-1/2 -translate-x-1/2 bg-white p-4 rounded shadow-lg"
          >
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
              showDateDisplay={false}
              minDate={new Date()}
              maxDate={new Date("2026-12-31")}
            />
          </div>
        )}
      </div>

      {/* Guests */}
      <div className="flex md:flex-col max-md:gap-2 max-md:items-center">
        <label htmlFor="guests">Guests</label>
        <input
          type="number"
          id="guests"
          min={1}
          max={4}
          placeholder="0"
          className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none max-w-16"
          value={form.guests}
          onChange={handleChange}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-2 items-center">
        <button
          type="submit"
          className="flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white cursor-pointer"
        >
          <img src={assets.searchIcon} alt="" className="h-4" />
          <span>Search</span>
        </button>

        <button
          type="button"
          onClick={handleClearFilters}
          className="flex items-center justify-center gap-1 rounded-md bg-gray-200 py-3 px-4 text-gray-700 cursor-pointer hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

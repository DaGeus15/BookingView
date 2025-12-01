import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useAppContext } from "../hooks/useAppContext";

import { assets, facilityIcons } from "../assets/assets";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const guests = Number(searchParams.get("guests") || 1);
  const checkInStr = searchParams.get("checkIn");
  const checkOutStr = searchParams.get("checkOut");

  const parseDate = (str) => {
    if (!str) return null;
    const [year, month, day] = str.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const checkIn = parseDate(checkInStr);
  const checkOut = parseDate(checkOutStr);

  const { rooms, getToken, axios, navigate } = useAppContext();
  const [room, setRoom] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState([
    { startDate: checkIn, endDate: checkOut, key: "selection" },
  ]);

  const [guestsState, setGuestsState] = useState(guests);
  const [showCalendar, setShowCalendar] = useState(false);
  const [error, setError] = useState("");
  const calendarRef = useRef();

  // Cargar habitación
  useEffect(() => {
    const room = rooms.find((r) => r._id === id);
    if (room) {
      setRoom(room);
      setMainImage(room.images[0]);
    }
  }, [id, rooms]);

  // Cerrar calendario si hace click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  // Diferencia de días
  const getDayDifference = () => {
    const { startDate, endDate } = dateRange[0];
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const nights = getDayDifference();
  // Check availability
  const checkAvailability = async () => {
    try {
      setError("");
      const days = getDayDifference();
      if (days < 2) {
        setError("⚠️ La estancia mínima es de 2 noches (3 días).");
        return;
      }

      if (!dateRange[0].startDate || !dateRange[0].endDate) {
        setError("Selecciona fechas válidas primero");
        return;
      }

      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id,
        dateRange,
      });

      if (data.success) {
        if (data.isAvailable) {
          setIsAvailable(true);
          toast.success("Room is available!");
        } else {
          setIsAvailable(false);
          toast.error("Room is not available");
        }
        // Solo mostrar si hay mensaje
        if (data.message) toast(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    setError("");

    // Validar que haya fechas seleccionadas
    if (!dateRange[0].startDate || !dateRange[0].endDate) {
      setError("Select dates first");
      return;
    }

    const days = getDayDifference();
    if (days < 2) {
      setError("⚠️ The minimum stay is 2 nights (3 days).");
      return;
    }

    try {
      if (!isAvailable) {
        // Solo check availability
        await checkAvailability();
        return;
      }

      // Si ya está disponible, crear reserva
      const { data } = await axios.post(
        "/api/bookings/book",
        {
          room: id,
          guests: guestsState,
          dateRange: [
            {
              startDate: dateRange[0].startDate,
              endDate: dateRange[0].endDate,
            },
          ],
          paymentMethod: "Pay At Hotel",
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success("Booking created successfully");
        navigate("/my-bookings");
        scrollTo(0, 0);
        setIsAvailable(false); // Reset disponibilidad
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Room Details */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-playfair">
            {room.hotel.name}{" "}
            <span className="font-inter text-sm">({room.roomType})</span>
          </h1>
        </div>

        {/* Room Address */}
        <div>
          <img src={assets.locationIcon} alt="location-icon" />
          <span>{room.hotel.address}</span>
        </div>

        {/* Room Images */}
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-1/2 w-full">
            <img
              src={mainImage}
              alt="Room Image"
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room.images.map((image, index) => (
              <img
                onClick={() => setMainImage(image)}
                key={index}
                src={image}
                alt="Room Image"
                className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${
                  mainImage === image && "outline-3 outline-orange-500"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Room Highlights */}
        <div className="flex flex-col md:flex-row md:justify-between mt-10">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair">
              Experience Luxury Like Never Before
            </h1>
            <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
              {room.amenities.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
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
          </div>
          <p className="text-2xl font-medium">
            ${room.pricePerNight * nights * guestsState} total ({guestsState}{" "}
            guest{guestsState > 1 ? "s" : ""} • {nights} night
            {nights > 1 ? "s" : ""})
          </p>
        </div>

        {/* CheckIn CheckOut Form */}
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-4xl"
        >
          <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">
            {/* Dates selector */}
            <div className="relative flex flex-col">
              <label className="font-medium">Dates</label>
              <input
                disabled={isAvailable}
                type="text"
                readOnly
                value={
                  dateRange[0].startDate && dateRange[0].endDate
                    ? `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                    : "Select dates"
                }
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none cursor-pointer"
                onClick={() => setShowCalendar((prev) => !prev)}
              />
              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute z-50 mt-2 bg-white p-4 rounded shadow-lg"
                >
                  <DateRange
                    editableDateInputs={true}
                    onChange={(item) => {
                      setDateRange([item.selection]);
                      setIsAvailable(false);
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    showDateDisplay={false}
                    minDate={new Date()} // 🔹 no permitir fechas pasadas
                  />
                </div>
              )}
            </div>

            {/* Guests */}
            <div className="flex flex-col">
              <label htmlFor="guests" className="font-medium">
                Guests
              </label>
              <input
                onChange={(e) => setGuestsState(Number(e.target.value))}
                value={guestsState}
                type="number"
                min={1}
                max={4}
                id="guests"
                placeholder="1"
                className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 hover:animate-scale active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer"
          >
            {isAvailable ? "Book Now" : "Check Availability"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-3">{error}</p>}
      </div>
    )
  );
};

export default RoomDetails;

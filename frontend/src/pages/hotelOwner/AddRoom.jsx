import React, { useState } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import toast from 'react-hot-toast';
import { useAppContext } from "../../hooks/useAppContext";

const AddRoom = () => {
  const { axios, getToken } = useAppContext();

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null
  });

  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: 0,
    amenities: {
      'Free Wifi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    }
  });

  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!inputs.roomType || !inputs.pricePerNight || !Object.values(images).some(img => img)) {
      toast.error('Please fill all the fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('roomType', inputs.roomType);
      formData.append('pricePerNight', inputs.pricePerNight);

      const amenities = Object.keys(inputs.amenities).filter(key => inputs.amenities[key]);
      formData.append('amenities', JSON.stringify(amenities));

      Object.keys(images).forEach(key => {
        images[key] && formData.append('images', images[key]);
      });

      const { data } = await axios.post('/api/rooms/', formData, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });

      if (data.success) {
        toast.success(data.message);
        setInputs({
          roomType: '',
          pricePerNight: 0,
          amenities: {
            'Free Wifi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false
          }
        });
        setImages({ 1: null, 2: null, 3: null, 4: null });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="w-full p-6 min-h-screen">
      <Title
        align='left'
        font='outfit'
        title='Add Room'
        subTitle='Provide accurate room details, pricing, and amenities to enhance the user booking experience.'
      />

      {/* Image Upload */}
      <p className='text-gray-800 mt-8 mb-2 font-semibold'>Room Images</p>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        {Object.keys(images).map(key => (
          <label key={key} htmlFor={`roomImage${key}`} className="cursor-pointer group">
            <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-primary transition">
              <img
                className='object-cover w-full h-full group-hover:opacity-90 transition-opacity'
                src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
                alt={`Room ${key}`}
              />
            </div>
            <input
              type="file"
              accept='image/*'
              id={`roomImage${key}`}
              hidden
              onChange={e => setImages({ ...images, [key]: e.target.files[0] })}
            />
          </label>
        ))}
      </div>

      {/* Room Details */}
      <div className='flex flex-col sm:flex-row gap-6 mt-6 w-full'>
        <div className='flex-1'>
          <label className='text-gray-800 font-semibold'>Room Type</label>
          <select
            value={inputs.roomType}
            onChange={e => setInputs({ ...inputs, roomType: e.target.value })}
            className='mt-1 w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition'
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div className='flex-1'>
          <label className='text-gray-800 font-semibold'>Price per Night</label>
          <input
            type="number"
            min={0}
            value={inputs.pricePerNight}
            onChange={e => setInputs({ ...inputs, pricePerNight: e.target.value })}
            placeholder='0'
            className='mt-1 w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary transition'
          />
        </div>
      </div>

      {/* Amenities */}
      <p className='text-gray-800 mt-6 mb-2 font-semibold'>Amenities</p>
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 w-full'>
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <label key={index} className='flex items-center gap-2 cursor-pointer text-gray-700 hover:text-primary transition'>
            <input
              type="checkbox"
              checked={inputs.amenities[amenity]}
              onChange={() => setInputs({
                ...inputs,
                amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity] }
              })}
              className='w-5 h-5 accent-primary'
            />
            {amenity}
          </label>
        ))}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='mt-8 w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition disabled:opacity-50'
      >
        {loading ? 'Adding...' : 'Add Room'}
      </button>
    </form>
  );
};

export default AddRoom;

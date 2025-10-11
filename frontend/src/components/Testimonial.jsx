import React from "react";
import Title from "./Title";
import { testimonials } from "../assets/assets";

const Testimonial = () => {
  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30">
      <Title
        title="What Our Guests Say"
        subTitle="Discover why discerning travelers consistently choose BookingView for their exclusive and comfortable accommodations worldwide."
      />

      <div className="grid gap-12 text-center md:grid-cols-2 mt-10">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="mb-6 md:mb-0">
            <div className="mb-6 flex justify-center">
              <img
                src={testimonial.image}
                className="w-24 rounded-full shadow-lg dark:shadow-black/30"
                alt={testimonial.name}
              />
            </div>
            <p className="my-4 sm:text-lg text-neutral-500 dark:text-neutral-300">
              {testimonial.review}
            </p>
            <p className="italic sm:text-lg">- {testimonial.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;

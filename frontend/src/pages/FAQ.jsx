import React, { useState } from "react";

const faqsData = [
  {
    question: "How do I make a reservation?",
    answer:
      "Select your desired dates, choose the room type, and follow the checkout process to complete your reservation.",
  },
  {
    question: "Can I modify or cancel my booking?",
    answer:
      "Yes, you can modify or cancel your booking according to our cancellation policy. Visit 'My Bookings' to make changes.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept credit/debit cards, PayPal, and Pay at establishment where available.",
  },
  {
    question: "What are the check-in and check-out times?",
    answer:
      "Check-in is from 2:00 PM and check-out is until 12:00 PM. Early check-in or late check-out may be available on request.",
  },
  {
    question: "Are there any special services included?",
    answer:
      "Our rooms include free Wi-Fi, daily housekeeping, and complimentary toiletries. Additional services may be available depending on the establishment.",
  },
  {
    question: "Can I bring pets?",
    answer:
      "Pet policies vary by establishment. Please check the specific room details or contact customer support.",
  },
];

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-300 last:border-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left py-4 flex justify-between items-center focus:outline-none cursor-pointer hover:bg-gray-100 transition-colors duration-200 rounded-md px-3"
      >
        <span className="font-medium text-gray-800">{question}</span>
        <span className="text-gray-500">{isOpen ? "-" : "+"}</span>
      </button>

      {isOpen && <p className="text-gray-600 pb-4">{answer}</p>}
    </div>
  );
};

const FAQ = () => {
  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-16 bg-gray-50 text-gray-700 max-w-4xl mx-auto mt-32">
      <h1 className="text-3xl md:text-4xl font-playfair text-gray-900 mb-6 text-center">
        Frequently Asked Questions
      </h1>
      <p className="text-center text-gray-600 mb-10">
        Here you can find answers to the most common questions about Booking
        View.
      </p>
      <div className="space-y-2">
        {faqsData.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};

export default FAQ;

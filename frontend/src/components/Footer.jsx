import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";




const Footer = () => {
  const linkSections = [
    {
      title: "Quick Links",
      links: [
        { name: "Home", href: "/" },
        { name: "Contact Us", href: "/contact" },
        { name: "FAQs", href: "/faqs" }
      ]
    },
    {
      title: "Follow Us",
      links: [
        { name: "Instagram", href: "https://instagram.com", external: true },
        { name: "Twitter", href: "https://twitter.com", external: true },
        { name: "Facebook", href: "https://facebook.com", external: true }
      ]
    }
  ];

  const teamMembers = [
    { name: "Constante Naranjo Fabricio Sebastián", email: "constante4965@uta.edu.ec", phone: "0983372092" },
    { name: "Conterón Villamarín Britani Jhanina", email: "bconteron3403@uta.edu.ec", phone: "0995965167" },
    { name: "García Fernández Daylé", email: "jgarcia3685@uta.edu.ec", phone: "0964189911" },
    { name: "Montero López Pablo Andrés", email: "dgarcia7531@uta.edu.ec", phone: "0984398542" }
  ];

  return (
    <div className="bg-gray-50 text-gray-700">
      {/* Footer principal: logo + links */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-10 border-b border-gray-300 flex flex-col md:flex-row justify-between gap-10">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3">
            <img className="w-16" src={assets.homeIcon} alt="Booking View Logo" />
            <h2 className="text-2xl md:text-3xl font-bold">Booking View</h2>
          </div>
          <p className="max-w-[400px] mt-4 text-sm md:text-base">
            Booking platform developed by our project team from the Technical University of Ambato.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          {linkSections.map((section, idx) => (
            <div key={idx}>
              <h3 className="font-semibold text-base text-gray-900 mb-2 md:mb-5">{section.title}</h3>
              <ul className="text-sm space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : "_self"}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="hover:underline transition"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Sección equipo: debajo del footer */}
      <div className="px-6 md:px-16 lg:px-24 xl:px-32 py-10">
        <h3 className="font-semibold text-lg text-gray-900 mb-6 text-center">Meet Our Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => (
            <div key={i} className="p-4 border rounded-md bg-white shadow-sm">
              <p className="font-medium mb-1">{member.name}</p>
              <p className="text-sm">Email: <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">{member.email}</a></p>
              <p className="text-sm">Phone: {member.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <p className="py-4 text-center text-sm md:text-base text-gray-500/80 mt-6">
        Copyright 2025 © <span className="font-semibold">Booking View</span>. All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;

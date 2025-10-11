import React from 'react';
import { assets } from '../assets/assets';

const Footer = () => {
    const linkSections = [
        {
            title: "Quick Links",
            links: ["Home", "Best Sellers", "Offers & Deals", "Contact Us", "FAQs"]
        },
        {
            title: "Need Help?",
            links: ["Delivery Information", "Return & Refund Policy", "Payment Methods", "Track your Order", "Contact Us"]
        },
        {
            title: "Follow Us",
            links: ["Instagram", "Twitter", "Facebook", "YouTube"]
        }
    ];

    const teamMembers = [
        {
            name: "Constante Naranjo Fabricio Sebastián",
            email: "constante4965@uta.edu.ec",
            phone: "0983372092"
        },
        {
            name: "Conterón Villamarín Britani Jhanina",
            email: "bconteron3403@uta.edu.ec",
            phone: "0995965167"
        },
        {
            name: "García Fernández Daylé",
            email: "jgarcia3685@uta.edu.ec",
            phone: "0964189911"
        },
        {
            name: "Montero López Pablo Andrés",
            email: "dgarcia7531@uta.edu.ec",
            phone: "0984398542"
        }
    ];

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-32 bg-gray-50">
            <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-300 text-gray-700">
                <div>
                    <div className='flex items-center gap-3'>
                        <img className="w-16 md:w-16" src={assets.homeIcon} alt="Booking View Logo" />
                        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold">
                            Booking View
                        </h2>
                    </div>
                    <p className="max-w-[410px] mt-4 text-sm md:text-base">
                        Booking platform developed by our project team from the Technical University of Ambato.
                    </p>
                </div>

                <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
                    {linkSections.map((section, index) => (
                        <div key={index}>
                            <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">{section.title}</h3>
                            <ul className="text-sm space-y-1">
                                {section.links.map((link, i) => (
                                    <li key={i}>
                                        <a href="#" className="hover:underline transition">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="py-6">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Our Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700">
                    {teamMembers.map((member, i) => (
                        <div key={i} className="p-3 border rounded-md bg-white shadow-sm">
                            <p className="font-medium">{member.name}</p>
                            <p>Email: <a href={`mailto:${member.email}`} className="hover:underline">{member.email}</a></p>
                            <p>Phone: {member.phone}</p>
                        </div>
                    ))}
                </div>
            </div>

            <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
                Copyright 2025 © <span className="font-semibold">Booking View</span>. All Rights Reserved.
            </p>
        </div>
    );
};

export default Footer;

export interface Testimonial {
  name: string;
  role?: string;
  rating: number;
  quote: string;
  date: string;
  featured?: boolean;
}

export const testimonials: Testimonial[] = [
  {
    name: "Melissa R.",
    role: "Community Manager, Dallas apartment community",
    rating: 5,
    quote:
      "Fred's Plumbing has been responsive, professional, and reliable whenever our property needs urgent service. Their communication is clear, and their team consistently follows through.",
    date: "March 2026",
    featured: true,
  },
  {
    name: "James T.",
    role: "Regional Maintenance Director",
    rating: 5,
    quote:
      "They handle everything from unit turnovers to emergency backups across several of our properties. Scheduling is easy and the work is documented properly every time.",
    date: "January 2026",
  },
  {
    name: "Angela M.",
    role: "Property Manager, Fort Worth",
    rating: 5,
    quote:
      "We had a major water line issue on a Friday night and their crew was on site fast. They kept residents informed and had us back up and running by morning.",
    date: "November 2025",
  },
  {
    name: "David K.",
    role: "Facilities Manager, commercial office",
    rating: 5,
    quote:
      "Straightforward pricing, courteous technicians, and they actually show up when they say they will. Exactly what we need in a commercial vendor.",
    date: "September 2025",
  },
];

import {
  Building,
  Building2,
  CalendarCheck,
  Cog,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Hotel,
  MapPin,
  Siren,
  Stethoscope,
  Waves,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { NavIconName } from "@/data/navigation";

/**
 * Resolves the string icon tokens carried by the navigation data (which must
 * stay serializable across the Server→Client boundary) to lucide components.
 */
export const navIcons: Record<NavIconName, LucideIcon> = {
  wrench: Wrench,
  cog: Cog,
  siren: Siren,
  waves: Waves,
  "calendar-check": CalendarCheck,
  "building-2": Building2,
  "heart-pulse": HeartPulse,
  "graduation-cap": GraduationCap,
  building: Building,
  hotel: Hotel,
  "heart-handshake": HeartHandshake,
  stethoscope: Stethoscope,
  "map-pin": MapPin,
};

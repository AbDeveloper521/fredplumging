import { getNavigation } from "@/sanity/lib/getNavigation";
import { getSite } from "@/sanity/lib/getSite";
import { HeaderClient } from "@/components/layout/HeaderClient";

/**
 * Server component — resolves navigation and site settings once per request
 * so the interactive header tree receives plain serializable props.
 */
export async function Header() {
  const [navigation, site] = await Promise.all([getNavigation(), getSite()]);

  return <HeaderClient navigation={navigation} site={site} />;
}

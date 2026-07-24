import { getNavigation } from "@/data/navigation";
import { HeaderClient } from "@/components/layout/HeaderClient";

/**
 * Server component — resolves the navigation once per request so the menu can
 * later be driven by a CMS without touching the interactive components.
 */
export async function Header() {
  const navigation = await getNavigation();

  return <HeaderClient navigation={navigation} />;
}

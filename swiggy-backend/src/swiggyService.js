// swiggyService.js
import axios from "axios";

const SWIGGY_BASE_LAT = 28.7040592;
const SWIGGY_BASE_LNG = 77.10249019999999;

export async function fetchRestaurantsFromSwiggy(
  lat = SWIGGY_BASE_LAT,
  lng = SWIGGY_BASE_LNG
) {
  const swiggyApi = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${lat}&lng=${lng}&is-seo-homepage-enabled=true`;

  const response = await axios.get(swiggyApi, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  const cards = response?.data?.data?.cards || [];

  const restaurants =
    cards.flatMap(
      (c) =>
        c?.card?.card?.gridElements?.infoWithStyle?.restaurants ||
        c?.card?.gridElements?.infoWithStyle?.restaurants ||
        []
    ) || [];

  return restaurants.map((r) => ({
    id: r.info.id,
    name: r.info.name,
    avgRating: Number(r.info.avgRating || 0),
    cuisines: r.info.cuisines || [],
    areaName: r.info.areaName,
    costForTwo: r.info.costForTwo || "",
    slaString: r.info.sla?.slaString || "",
    cloudinaryImageId: r.info.cloudinaryImageId,
    veg: r.info.veg || false,
  }));
}

export async function fetchMenuFromSwiggy(
  id,
  lat = SWIGGY_BASE_LAT,
  lng = SWIGGY_BASE_LNG
) {
  const swiggyServer = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=${lat}&lng=${lng}&restaurantId=${id}&catalog_qa=undefined&submitAction=ENTER`;

  const response = await axios.get(swiggyServer, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
  });

  const data = response?.data?.data;
  if (!data) {
   
    return [];
  }

  // Swiggy nesting: groupedCard.cardGroupMap.REGULAR.cards[*].card.card.itemCards
  const regularCards =
    data?.cards?.find((c) => c.groupedCard)?.groupedCard?.cardGroupMap
      ?.REGULAR?.cards || [];

  const itemCards = regularCards.flatMap((c) => {
    const card = c?.card?.card || c?.card;
    return card?.itemCards || [];
  });

  const items = itemCards.map((ic) => ic.card?.info).filter(Boolean);

  const normalized = items.map((info) => {
    const rawPrice = info.price ?? info.defaultPrice ?? 0; // paise
    const priceInRupees = rawPrice / 100;

    const isVeg =
      info.isVeg === 1 ||
      info.itemAttribute?.vegClassifier === "VEG" ||
      info.veg === true;

    return {
      id: info.id?.toString(),
      name: info.name || "",
      description: info.description || "",
      price: priceInRupees,
      isVeg,
    };
  });

  console.log(`Menu for restaurant ${id}:`, normalized.length, "items");

  return normalized; // 👈 flat array
}

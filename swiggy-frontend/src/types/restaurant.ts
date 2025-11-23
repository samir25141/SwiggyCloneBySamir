export interface Restaurant {
  id: string;
  name: string;
  avgRating: number;
  cuisines: string[];
  areaName?: string;
  costForTwo?: string;
  slaString?: string;
  cloudinaryImageId?: string;
  veg?: boolean;
}

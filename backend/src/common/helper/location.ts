import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number,
) => {
  const point = `POINT(${longitude} ${latitude})`;
  await prisma.$queryRaw`
        INSERT INTO "user_locations" ("userId", location) 
        VALUES (${userId}::uuid, ST_GeomFromText(${point}, 4326))`;
};

export const updateUserLocation = async (
  userId: string,
  latitude: number,
  longitude: number,
) => {
  const point = `POINT(${longitude} ${latitude})`;
  await prisma.$queryRaw`
        UPDATE "user_locations"
        SET location = ST_GeomFromText(${point}, 4326)
        WHERE "userId" = ${userId}::uuid`;
};

interface UserLocationRaw {
  userId: string;
  location: string;
  distance_miles: number;
}

export const getNearbyUsers = async (
  latitude: number,
  longitude: number,
  radius: number,
): Promise<UserLocationRaw[]> => {
  const point = `POINT(${longitude} ${latitude})`;

  const formattedRadius = radius * 1609.344;

  // Find all user locations within a 10-mile radius
  const nearbyLocations = await prisma.$queryRaw`
      SELECT "userId", ST_AsText(location) as location,
        ST_Distance(
          location::geography,
          ST_GeomFromText(${point}, 4326)::geography
        ) / 1609.344 as distance_miles
      FROM "user_locations"
      WHERE ST_DWithin(
        location::geography,
        ST_GeomFromText(${point}, 4326)::geography,
        ${formattedRadius}
      )`;

  return nearbyLocations as UserLocationRaw[];
};

interface UserLocation {
  userId: string;
  location: string;
  longitude: number;
  latitude: number;
}

interface UserLocationReturn {
  userId: string;
  longitude: number;
  latitude: number;
}

export const getUserLocation = async (
  userId: string,
): Promise<UserLocationReturn> => {
  const userLocation: UserLocation[] = await prisma.$queryRaw`
  SELECT "userId", ST_AsText(location) as location,
         ST_X(location::geometry) as longitude,
         ST_Y(location::geometry) as latitude
  FROM "user_locations"
  WHERE "userId" = ${userId}::uuid`;

  if (userLocation && userLocation[0]) {
    return {
      userId: userLocation[0].userId,
      longitude: parseFloat(userLocation[0].longitude.toString()),
      latitude: parseFloat(userLocation[0].latitude.toString()),
    };
  }

  return userLocation as unknown as UserLocationReturn;
};

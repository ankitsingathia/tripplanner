import { fetchTrips, removeTrip, saveTrip } from "./firebase";

const storageKey = "wanderly.demo.trips";

function readLocalTrips() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function writeLocalTrips(trips) {
  localStorage.setItem(storageKey, JSON.stringify(trips));
}

export async function loadTripsForUser(user) {
  if (user?.uid && !user.demo) {
    return fetchTrips(user.uid);
  }

  return readLocalTrips();
}

export async function persistTripForUser(user, trip) {
  if (user?.uid && !user.demo) {
    return saveTrip(user.uid, trip);
  }

  const savedTrip = { ...trip, id: trip.id || crypto.randomUUID() };
  const trips = [savedTrip, ...readLocalTrips()];
  writeLocalTrips(trips);
  return savedTrip;
}

export async function deleteTripForUser(user, tripId) {
  if (user?.uid && !user.demo) {
    return removeTrip(user.uid, tripId);
  }

  writeLocalTrips(readLocalTrips().filter((trip) => trip.id !== tripId));
}


import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  ZoomControl,
  useMapEvents,
} from "react-leaflet";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CarFront,
  Clock3,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Users,
  Zap,
  CheckCircle2,
  X,
  LocateFixed,
} from "lucide-react";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./BookingPage.css";
import "./BookingLocationSearch.css";

// ==========================================
// TYPES
// ==========================================

type Place = {
  name: string;
  area: string;
  position: [number, number];
};

type RouteApiResponse = {
  success: boolean;
  distanceKm: number;
  durationMinutes: number;
  visitedNodes: number;
  routeCoordinates: [number, number][];
  algorithm: string;
  error?: string;
};

type BookingApiResponse = {
  success: boolean;
  message: string;
  booking?: {
    id: string;
    status: string;
    vehicle_type: string;
    distance_km: number | string;
    estimated_fare: number | string;
    scheduled_for: string;
    created_at: string;
  };
};

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    street?: string;
    district?: string;
    locality?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

type LocationSearchState = {
  suggestions: Place[];
  loading: boolean;
  error: string;
};

// ==========================================
// DEFAULT LOCATIONS
// ==========================================

const places: Place[] = [
  {
    name: "Chandigarh University",
    area: "Gharuan, Mohali",
    position: [30.7683, 76.5754],
  },
  {
    name: "Elante Mall",
    area: "Industrial Area, Chandigarh",
    position: [30.7051, 76.8010],
  },
  {
    name: "Sukhna Lake",
    area: "Sector 1, Chandigarh",
    position: [30.7421, 76.8188],
  },
  {
    name: "ISBT Sector 17",
    area: "Sector 17, Chandigarh",
    position: [30.7415, 76.7821],
  },
  {
    name: "Mohali Railway Station",
    area: "Sahibzada Ajit Singh Nagar",
    position: [30.6675, 76.7297],
  },
  {
    name: "Chandigarh Airport",
    area: "Mohali",
    position: [30.6735, 76.7885],
  },
  {
    name: "Panjab University",
    area: "Sector 14, Chandigarh",
    position: [30.7600, 76.7690],
  },
  {
    name: "VR Punjab Mall",
    area: "Kharar, Mohali",
    position: [30.7250, 76.6420],
  },
  {
    name: "Panchkula Bus Stand",
    area: "Sector 5, Panchkula",
    position: [30.6942, 76.8606],
  },
  {
    name: "Zirakpur",
    area: "VIP Road, Zirakpur",
    position: [30.6425, 76.8173],
  },
];

// ==========================================
// VEHICLE OPTIONS
// ==========================================

const vehicleTypes = [
  {
    id: "bike",
    name: "RideFlow Bike",
    description: "Quick and affordable",
    icon: Bike,
    passengers: "1",
    base: 20,
    perKm: 7,
    eta: 3,
  },
  {
    id: "auto",
    name: "RideFlow Auto",
    description: "Compact city rides",
    icon: Zap,
    passengers: "3",
    base: 30,
    perKm: 10,
    eta: 4,
  },
  {
    id: "mini",
    name: "RideFlow Mini",
    description: "Affordable everyday rides",
    icon: CarFront,
    passengers: "4",
    base: 45,
    perKm: 12,
    eta: 5,
  },
  {
    id: "sedan",
    name: "RideFlow Sedan",
    description: "Comfortable and spacious",
    icon: CarFront,
    passengers: "4",
    base: 65,
    perKm: 15,
    eta: 7,
  },
  {
    id: "suv",
    name: "RideFlow SUV",
    description: "Extra space for everyone",
    icon: CarFront,
    passengers: "6",
    base: 95,
    perKm: 20,
    eta: 9,
  },
];

// ==========================================
// DISTANCE CALCULATION
// ==========================================

function distanceBetween(a: Place, b: Place) {
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const [lat1, lon1] = a.position;
  const [lat2, lon2] = b.position;

  const earthRadius = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
  );
}

// ==========================================
// DYNAMIC LOCATION SEARCH - PHOTON API
// ==========================================

function useLocationSearch(
  query: string,
  enabled: boolean
): LocationSearchState {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const trimmed = query.trim();

    if (!enabled || trimmed.length < 3) {
      setSuggestions([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const searchPhoton = async (
          searchQuery: string,
          useBoundingBox: boolean
        ): Promise<PhotonResponse> => {
          const params = new URLSearchParams({
            q: searchQuery,
            limit: "20",
            lang: "en",
            countrycode: "IN",
            lat: "30.73",
            lon: "76.75",
            zoom: "12",
          });

          if (useBoundingBox) {
            params.set("bbox", "76.50,30.50,77.00,30.90");
          }

          const response = await fetch(
            `https://photon.komoot.io/api/?${params.toString()}`,
            {
              signal: controller.signal,
              headers: {
                Accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Location search failed (${response.status}).`
            );
          }

          return (await response.json()) as PhotonResponse;
        };

        // FIRST SEARCH: EXACT LOCATION
        let data = await searchPhoton(trimmed, true);

        // SECOND SEARCH: MOHALI FALLBACK
        if (!data.features?.length) {
          data = await searchPhoton(
            `${trimmed}, Mohali, Punjab, India`,
            false
          );
        }

        // CONVERT PHOTON RESULTS INTO PLACES
        const results: Place[] = (data.features ?? [])
          .map((feature) => {
            const coordinates = feature.geometry?.coordinates;
            const properties = feature.properties;

            if (!coordinates || !properties) return null;

            // Photon coordinates are [longitude, latitude].
            const [longitude, latitude] = coordinates;

            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude)
            ) {
              return null;
            }

            // Restrict results to Chandigarh Tricity.
            if (
              latitude < 30.50 ||
              latitude > 30.90 ||
              longitude < 76.50 ||
              longitude > 77.00
            ) {
              return null;
            }

            const name =
              properties.name ||
              properties.street ||
              properties.locality ||
              properties.city ||
              "Unnamed location";

            const area = [
              properties.street && properties.street !== name
                ? properties.street
                : "",
              properties.locality,
              properties.district,
              properties.city,
              properties.state,
              properties.postcode,
            ]
              .filter(Boolean)
              .filter(
                (value, index, values) =>
                  values.indexOf(value) === index
              )
              .join(", ");

            return {
              name,
              area: area || properties.country || "Chandigarh Tricity",
              position: [latitude, longitude] as [number, number],
            };
          })
          .filter((place): place is Place => place !== null);

        setSuggestions(results);
      } catch (searchError) {
        if (
          searchError instanceof Error &&
          searchError.name === "AbortError"
        ) {
          return;
        }

        setSuggestions([]);

        setError(
          searchError instanceof Error
            ? searchError.message
            : "Unable to search locations right now."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, enabled]);

  return {
    suggestions,
    loading,
    error,
  };
}

// ==========================================
// LOCATION INPUT COMPONENT
// ==========================================

function LocationField({
  label,
  value,
  onChange,
  onSelect,
  suggestions,
  loading,
  searchError,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: Place) => void;
  suggestions: Place[];
  loading: boolean;
  searchError: string;
  type: "pickup" | "dropoff";
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`booking-location-field ${type}`}>
      <span className="location-symbol">
        {type === "pickup" ? (
          <span className="pickup-dot" />
        ) : (
          <span className="dropoff-square" />
        )}
      </span>

      <div className="location-input-wrap location-search-wrap">
        <label>{label}</label>

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() =>
            window.setTimeout(() => setFocused(false), 180)
          }
          autoComplete="off"
          aria-label={label}
          aria-autocomplete="list"
          placeholder={
            type === "pickup"
              ? "Search any pickup location"
              : "Search any destination"
          }
        />

        {focused && value.trim().length >= 3 && (
          <div className="location-suggestions" role="listbox">
            {loading && (
              <div className="location-suggestion-message">
                Searching Tricity locations...
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="location-suggestion-message">
                {searchError ||
                  "No mapped places found. Try another name or a nearby landmark."}
              </div>
            )}

            {!loading &&
              suggestions.map((place, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected="false"
                  className="location-suggestion"
                  key={`${place.name}-${place.position[0]}-${place.position[1]}-${index}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(place);
                    setFocused(false);
                  }}
                >
                  <span className="location-suggestion-icon">
                    <MapPin size={15} />
                  </span>

                  <span className="location-suggestion-text">
                    <strong>{place.name}</strong>
                    <small>{place.area}</small>
                  </span>
                </button>
              ))}
          </div>
        )}
      </div>

      {type === "pickup" && (
        <Navigation size={18} className="location-action" />
      )}
    </div>
  );
}

// ==========================================
// MAP CLICK HANDLER
// ==========================================

function MapClickHandler({
  enabled,
  onPick,
}: {
  enabled: boolean;
  onPick: (position: [number, number]) => void;
}) {
  useMapEvents({
    click(event) {
      if (!enabled) return;

      onPick([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}

// ==========================================
// MAIN BOOKING PAGE
// ==========================================

export default function BookingPage() {
  const [pickupName, setPickupName] = useState(
    "Chandigarh University"
  );

  const [dropoffName, setDropoffName] = useState("Elante Mall");

  const [pickupLocation, setPickupLocation] = useState<Place | null>(
    places[0]
  );

  const [dropoffLocation, setDropoffLocation] = useState<Place | null>(
    places[1]
  );

  const [searched, setSearched] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("mini");
  const [confirmed, setConfirmed] = useState(false);
  const [rideTime, setRideTime] = useState("now");

  // DATABASE BOOKING STATES
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [savedBooking, setSavedBooking] =
    useState<BookingApiResponse["booking"] | null>(null);

  const [routeCoordinates, setRouteCoordinates] = useState<
    [number, number][]
  >([]);

  const [routeDistance, setRouteDistance] = useState<number | null>(
    null
  );

  const [routeDuration, setRouteDuration] = useState<number | null>(
    null
  );

  const [routing, setRouting] = useState(false);
  const [routeError, setRouteError] = useState("");

  // GPS AND MAP SELECTION STATES

  const [mapPickMode, setMapPickMode] = useState<
    "pickup" | "dropoff" | null
  >(null);

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // LOCATION SEARCH

  const pickupSearch = useLocationSearch(
    pickupName,
    !pickupLocation
  );

  const dropoffSearch = useLocationSearch(
    dropoffName,
    !dropoffLocation
  );

  const pickup = pickupLocation ?? places[0];
  const dropoff = dropoffLocation ?? places[1];

  // COMBINE LOCAL AND PHOTON SUGGESTIONS

  const buildSuggestions = (
    query: string,
    remote: Place[]
  ): Place[] => {
    const normalized = query.trim().toLowerCase();

    const localMatches = places.filter((place) =>
      `${place.name} ${place.area}`
        .toLowerCase()
        .includes(normalized)
    );

    const combined = [...localMatches, ...remote];
    const seen = new Set<string>();

    return combined
      .filter((place) => {
        const key =
          `${place.name.toLowerCase()}-` +
          `${place.position[0].toFixed(5)}-` +
          `${place.position[1].toFixed(5)}`;

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      })
      .slice(0, 10);
  };

  const pickupSuggestions = useMemo(
    () => buildSuggestions(pickupName, pickupSearch.suggestions),
    [pickupName, pickupSearch.suggestions]
  );

  const dropoffSuggestions = useMemo(
    () => buildSuggestions(dropoffName, dropoffSearch.suggestions),
    [dropoffName, dropoffSearch.suggestions]
  );

  // DISTANCE AND FARE

  const approximateDistance = useMemo(
    () => distanceBetween(pickup, dropoff) * 1.25,
    [pickup, dropoff]
  );

  const distance = routeDistance ?? approximateDistance;

  const estimatedMinutes =
    routeDuration !== null
      ? Math.round(routeDuration)
      : Math.max(
          8,
          Math.round((approximateDistance / 25) * 60)
        );

  const selected = vehicleTypes.find(
    (vehicle) => vehicle.id === selectedVehicle
  )!;

  const fareFor = (vehicle: (typeof vehicleTypes)[number]) =>
    Math.round(vehicle.base + distance * vehicle.perKm);

  // ========================================
  // RESET ROUTE WHEN LOCATIONS CHANGE
  // ========================================

  const resetRoute = () => {
    setRouteCoordinates([]);
    setRouteDistance(null);
    setRouteDuration(null);
    setRouteError("");
    setSearched(false);
    setConfirmed(false);
    setSavedBooking(null);
    setBookingError("");
  };

  // ========================================
  // TRICITY SERVICE AREA VALIDATION
  // ========================================

  const isInsideServiceArea = (
    latitude: number,
    longitude: number
  ) =>
    latitude >= 30.50 &&
    latitude <= 30.90 &&
    longitude >= 76.50 &&
    longitude <= 77.00;

  // ========================================
  // USE CURRENT GPS LOCATION
  // ========================================

  const useCurrentLocation = () => {
    setGpsError("");

    if (!navigator.geolocation) {
      setGpsError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        if (!isInsideServiceArea(latitude, longitude)) {
          setGpsError(
            "Your current location is outside RideFlow's Tricity service area."
          );

          setGpsLoading(false);
          return;
        }

        const currentPlace: Place = {
          name: "My current location",
          area: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          position: [latitude, longitude],
        };

        setPickupName(currentPlace.name);
        setPickupLocation(currentPlace);

        setMapPickMode(null);
        resetRoute();

        setGpsLoading(false);
      },

      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. Allow location access in your browser."
            : error.code === error.POSITION_UNAVAILABLE
              ? "Your current location is unavailable."
              : error.code === error.TIMEOUT
                ? "Location request timed out. Try again."
                : "Unable to get your current location.";

        setGpsError(message);
        setGpsLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // ========================================
  // SELECT LOCATION DIRECTLY ON MAP
  // ========================================

  const handleMapLocationSelect = (
    position: [number, number]
  ) => {
    if (!mapPickMode) return;

    const [latitude, longitude] = position;

    if (!isInsideServiceArea(latitude, longitude)) {
      setGpsError(
        "Please select a point inside the Tricity service area."
      );
      return;
    }

    const selectedPlace: Place = {
      name:
        mapPickMode === "pickup"
          ? "Map-selected pickup"
          : "Map-selected destination",

      area: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,

      position,
    };

    if (mapPickMode === "pickup") {
      setPickupName(selectedPlace.name);
      setPickupLocation(selectedPlace);
    } else {
      setDropoffName(selectedPlace.name);
      setDropoffLocation(selectedPlace);
    }

    setMapPickMode(null);
    setGpsError("");

    resetRoute();
  };

  // ========================================
  // SEARCH RIDES USING JAVA DIJKSTRA API
  // ========================================

  const handleSearch = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert(
        "Please select both pickup and destination from the location suggestions."
      );
      return;
    }

    if (
      pickupLocation.position[0] === dropoffLocation.position[0] &&
      pickupLocation.position[1] === dropoffLocation.position[1]
    ) {
      alert("Pickup and drop-off locations must be different.");
      return;
    }

    setRouting(true);
    setRouteError("");
    setSearched(false);
    setConfirmed(false);
    setSavedBooking(null);
    setBookingError("");

    try {
      const response = await fetch(
        "http://localhost:8081/api/route",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pickupLat: pickupLocation.position[0],
            pickupLon: pickupLocation.position[1],
            dropLat: dropoffLocation.position[0],
            dropLon: dropoffLocation.position[1],
          }),
        }
      );

      const data = (await response.json()) as RouteApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Dijkstra route calculation failed."
        );
      }

      if (
        !Array.isArray(data.routeCoordinates) ||
        data.routeCoordinates.length < 2 ||
        !Number.isFinite(data.distanceKm) ||
        !Number.isFinite(data.durationMinutes)
      ) {
        throw new Error(
          "The routing server returned an invalid route."
        );
      }

      setRouteCoordinates(data.routeCoordinates);
      setRouteDistance(data.distanceKm);
      setRouteDuration(data.durationMinutes);
      setSearched(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to connect to the RideFlow routing server.";

      setRouteError(message);
      setRouteCoordinates([]);
      setRouteDistance(null);
      setRouteDuration(null);
      setSearched(false);
    } finally {
      setRouting(false);
    }
  };

  // ========================================
  // CREATE REAL DATABASE BOOKING
  // ========================================

  const handleConfirmRide = async () => {
    if (!pickupLocation || !dropoffLocation || !searched) {
      setBookingError("Please select your locations and calculate the route first.");
      return;
    }

    if (bookingLoading) return;

    setBookingLoading(true);
    setBookingError("");
    setSavedBooking(null);
    setConfirmed(false);

    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pickupName: pickupLocation.name,
            dropoffName: dropoffLocation.name,

            pickupLat: pickupLocation.position[0],
            pickupLon: pickupLocation.position[1],

            dropoffLat: dropoffLocation.position[0],
            dropoffLon: dropoffLocation.position[1],

            vehicleType: selectedVehicle,
            distanceKm: distance,
            durationMinutes: estimatedMinutes,
            estimatedFare: fareFor(selected),
            rideTime,
          }),
        }
      );

      const data = (await response.json()) as BookingApiResponse;

      if (!response.ok || !data.success || !data.booking) {
        throw new Error(
          data.message || "Unable to create your booking."
        );
      }

      setSavedBooking(data.booking);
      setConfirmed(true);
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to connect to the RideFlow booking server."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // ========================================
  // PAGE UI
  // ========================================

  return (
    <main className="booking-page">
      <header className="booking-header">
        <div className="booking-header-left">
          <Link
            to="/"
            className="booking-back"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} />
          </Link>

          <Link to="/" className="booking-brand">
            <span className="booking-brand-mark">R</span>
            rideflow<span>.</span>
          </Link>

          <div className="booking-mode">
            <span className="booking-mode-active">
              <CarFront size={19} /> Ride
            </span>

            <span>
              <Navigation size={17} /> Travel
            </span>
          </div>
        </div>

        <div className="booking-header-right">
          <span className="booking-location-tag">
            <MapPin size={14} /> Chandigarh Tricity
          </span>

          <button className="booking-login">Log in</button>
          <button className="booking-signup">Sign up</button>
        </div>
      </header>

      <div className="booking-layout">
        <section className="booking-panel">
          <div className="booking-panel-heading">
            <div>
              <span className="booking-overline">
                RIDEFLOW MOBILITY
              </span>

              <h1>{searched ? "Choose your ride" : "Find a ride"}</h1>

              <p>
                {searched
                  ? "Choose the ride that fits your journey."
                  : "Your next journey starts here."}
              </p>
            </div>

            <span className="booking-heading-icon">
              <Navigation size={21} />
            </span>
          </div>

          {/* PICKUP AND DESTINATION */}

          <div className="booking-route-fields">
            <LocationField
              label="PICK-UP LOCATION"
              value={pickupName}
              onChange={(value) => {
                setPickupName(value);
                setPickupLocation(null);
                resetRoute();
              }}
              onSelect={(place) => {
                setPickupName(place.name);
                setPickupLocation(place);
                resetRoute();
              }}
              suggestions={pickupSuggestions}
              loading={pickupSearch.loading}
              searchError={pickupSearch.error}
              type="pickup"
            />

            <div className="route-connector">
              <span />
              <span />
              <span />
            </div>

            <LocationField
              label="DROP-OFF LOCATION"
              value={dropoffName}
              onChange={(value) => {
                setDropoffName(value);
                setDropoffLocation(null);
                resetRoute();
              }}
              onSelect={(place) => {
                setDropoffName(place.name);
                setDropoffLocation(place);
                resetRoute();
              }}
              suggestions={dropoffSuggestions}
              loading={dropoffSearch.loading}
              searchError={dropoffSearch.error}
              type="dropoff"
            />
          </div>

          {/* GPS AND MAP LOCATION SELECTION */}

          <div className="booking-location-actions">
            <button
              type="button"
              className="booking-gps-button"
              onClick={useCurrentLocation}
              disabled={gpsLoading}
            >
              <LocateFixed size={17} />

              {gpsLoading
                ? "Finding location..."
                : "Use my current location"}
            </button>

            <div className="booking-map-pick-actions">
              <button
                type="button"
                className={`booking-map-pick-button ${
                  mapPickMode === "pickup" ? "active" : ""
                }`}
                onClick={() => {
                  setGpsError("");

                  setMapPickMode(
                    mapPickMode === "pickup"
                      ? null
                      : "pickup"
                  );
                }}
              >
                <MapPin size={15} />
                Set pickup on map
              </button>

              <button
                type="button"
                className={`booking-map-pick-button ${
                  mapPickMode === "dropoff" ? "active" : ""
                }`}
                onClick={() => {
                  setGpsError("");

                  setMapPickMode(
                    mapPickMode === "dropoff"
                      ? null
                      : "dropoff"
                  );
                }}
              >
                <MapPin size={15} />
                Set destination on map
              </button>
            </div>

            {mapPickMode && (
              <p className="map-pick-instruction">
                <MapPin size={14} />

                Click the map to select your{" "}
                {mapPickMode === "pickup"
                  ? "pickup"
                  : "destination"}.

                <button
                  type="button"
                  onClick={() => setMapPickMode(null)}
                >
                  Cancel
                </button>
              </p>
            )}

            {gpsError && (
              <p className="route-error" role="alert">
                {gpsError}
              </p>
            )}
          </div>

          {/* PICKUP TIME */}

          <div className="booking-time-row">
            <Clock3 size={18} />

            <select
              value={rideTime}
              onChange={(event) => {
                setRideTime(event.target.value);
                setConfirmed(false);
                setSavedBooking(null);
                setBookingError("");
              }}
              aria-label="Pickup time"
            >
              <option value="now">Pickup now</option>
              <option value="15">In 15 minutes</option>
              <option value="30">In 30 minutes</option>
              <option value="60">In 1 hour</option>
            </select>
          </div>

          {/* SEARCH BUTTON */}

          <button
            className="booking-search-button"
            onClick={handleSearch}
            disabled={routing}
          >
            <Search size={18} />

            {routing
              ? "Calculating fastest route..."
              : searched
                ? "Update ride options"
                : "Search rides"}

            <ArrowRight size={18} />
          </button>

          {routing && (
            <p className="route-status">
              <span className="map-live-dot" />
              Running Dijkstra on the Tricity road network...
            </p>
          )}

          {routeError && (
            <p className="route-error" role="alert">
              {routeError}
            </p>
          )}

          {/* RIDE RESULTS */}

          {searched && (
            <div className="booking-results">
              <div className="booking-results-heading">
                <div>
                  <span className="booking-overline">
                    AVAILABLE OPTIONS
                  </span>

                  <h2>Choose your vehicle</h2>
                </div>

                <span className="booking-availability">
                  <span /> Dijkstra route
                </span>
              </div>

              {/* DISTANCE AND TIME */}

              <div className="booking-trip-summary">
                <div>
                  <span>EST. DISTANCE</span>
                  <strong>{distance.toFixed(1)} km</strong>
                </div>

                <div>
                  <span>EST. DURATION</span>
                  <strong>{estimatedMinutes} min</strong>
                </div>
              </div>

              {/* VEHICLE LIST */}

              <div className="vehicle-list">
                {vehicleTypes.map((vehicle) => {
                  const VehicleIcon = vehicle.icon;
                  const active = selectedVehicle === vehicle.id;

                  return (
                    <button
                      key={vehicle.id}
                      className={`vehicle-option ${
                        active ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setConfirmed(false);
                        setSavedBooking(null);
                        setBookingError("");
                      }}
                    >
                      <span className="vehicle-icon">
                        <VehicleIcon size={26} />
                      </span>

                      <span className="vehicle-details">
                        <strong>{vehicle.name}</strong>
                        <small>{vehicle.description}</small>

                        <small className="vehicle-capacity">
                          <Users size={12} />
                          {vehicle.passengers} seats
                          <span> · </span>
                          <Clock3 size={12} />
                          {vehicle.eta} min away
                        </small>
                      </span>

                      <span className="vehicle-price">
                        <strong>₹{fareFor(vehicle)}</strong>
                        <small>estimated</small>
                      </span>

                      <span className="vehicle-radio">
                        {active && <span />}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="fare-note">
                <ShieldCheck size={16} />

                <span>
                  Indicative fares for this project demo. The selected
                  fare and route details will be saved with your booking.
                </span>
              </div>

              {/* CONFIRM RIDE - DATABASE CONNECTED */}

              <button
                className="booking-confirm-button"
                onClick={handleConfirmRide}
                disabled={bookingLoading}
              >
                {bookingLoading
                  ? "Saving your booking..."
                  : `Confirm ${selected.name}`}

                <span>
                  ₹{fareFor(selected)}
                </span>
              </button>

              {/* BOOKING ERROR */}

              {bookingError && (
                <p className="route-error" role="alert">
                  {bookingError}
                </p>
              )}

              {/* DATABASE BOOKING CONFIRMATION */}

              {confirmed && savedBooking && (
                <div className="booking-confirmed">
                  <CheckCircle2 size={19} />

                  <div>
                    <strong>Ride booking saved successfully!</strong>

                    <p>
                      Booking ID: {savedBooking.id}
                    </p>

                    <p>
                      {selected.name} · ₹
                      {Number(savedBooking.estimated_fare).toFixed(2)}
                    </p>

                    <p>
                      Status: {savedBooking.status}
                    </p>

                    <p>
                      Your booking is stored in the RideFlow database.
                      No driver has been assigned and no payment has
                      been made yet.
                    </p>
                  </div>

                  <button
                    onClick={() => setConfirmed(false)}
                    aria-label="Dismiss confirmation"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div className="booking-panel-footer">
              <span className="footer-shield">
                <ShieldCheck size={17} />
              </span>

              <span>
                <strong>Every journey, considered.</strong>
                <small>
                  Designed for safer, smarter mobility.
                </small>
              </span>
            </div>
          )}
        </section>

        {/* MAP SECTION */}

        <section className="booking-map-section">
          <div className="map-topbar">
            <div>
              <span className="map-live-dot" />
              LIVE MAP PREVIEW
            </div>

            <span>CHANDIGARH · MOHALI · PANCHKULA</span>
          </div>

          <div className="booking-map">
            <MapContainer
              key={`${pickup.position.join(",")}-${dropoff.position.join(",")}`}
              center={[
                (pickup.position[0] + dropoff.position[0]) / 2,
                (pickup.position[1] + dropoff.position[1]) / 2,
              ]}
              zoom={11}
              zoomControl={false}
              scrollWheelZoom
              className={`rideflow-leaflet ${
                mapPickMode ? "map-selection-active" : ""
              }`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* MAP CLICK LISTENER */}

              <MapClickHandler
                enabled={mapPickMode !== null}
                onPick={handleMapLocationSelect}
              />

              {/* DIJKSTRA ROUTE */}

              {routeCoordinates.length > 1 && (
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: "#7354e8",
                    weight: 5,
                    opacity: 0.95,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              )}

              {/* PICKUP MARKER */}

              <CircleMarker
                center={pickup.position}
                radius={9}
                pathOptions={{
                  color: "#ffffff",
                  weight: 4,
                  fillColor: "#23c9ad",
                  fillOpacity: 1,
                }}
              />

              {/* DESTINATION MARKER */}

              <CircleMarker
                center={dropoff.position}
                radius={9}
                pathOptions={{
                  color: "#ffffff",
                  weight: 4,
                  fillColor: "#8058ec",
                  fillOpacity: 1,
                }}
              />

              <ZoomControl position="bottomright" />
            </MapContainer>

            <div className="map-location-card map-pickup-card">
              <span className="map-pin pickup-pin" />

              <div>
                <small>PICK-UP</small>
                <strong>{pickup.name}</strong>
              </div>
            </div>

            <div className="map-location-card map-dropoff-card">
              <span className="map-pin dropoff-pin" />

              <div>
                <small>DROP-OFF</small>
                <strong>{dropoff.name}</strong>
              </div>
            </div>

            <div className="map-distance-pill">
              <Navigation size={13} />

              {distance.toFixed(1)} km{" "}
              {routeDistance !== null ? "road route" : "approx."}
            </div>
          </div>

          <div className="map-bottom-info">
            <span>
              <span className="map-legend pickup-legend" />
              Pickup point
            </span>

            <span>
              <span className="map-legend dropoff-legend" />
              Destination
            </span>

            <span className="map-preview-note">
              <Zap size={13} /> Route preview
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

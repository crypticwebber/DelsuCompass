import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";
import type { NavigationMode, NavigationRoute } from "./navigation.types.js";

const profiles: Record<NavigationMode, string> = {
  walking: "foot-walking",
  driving: "driving-car",
  cycling: "cycling-regular",
};

type Point = { latitude: number; longitude: number };

type OrsStep = {
  distance?: number;
  duration?: number;
  instruction?: string;
  name?: string;
  way_points?: [number, number];
};

type OrsResponse = {
  features?: Array<{
    geometry?: { coordinates?: [number, number][] };
    properties?: {
      summary?: { distance?: number; duration?: number };
      segments?: Array<{ steps?: OrsStep[] }>;
    };
  }>;
  error?: { message?: string; code?: number } | string;
};

function providerMessage(payload: OrsResponse) {
  return typeof payload.error === "string" ? payload.error : payload.error?.message;
}

export const navigationService = {
  async directions(start: Point, destination: Point, mode: NavigationMode): Promise<NavigationRoute> {
    const apiKey = env.OPENROUTESERVICE_API_KEY?.trim();
    if (!apiKey) {
      throw new AppError(
        503,
        "ROUTING_NOT_CONFIGURED",
        "Turn-by-turn routing is not configured yet. Add OPENROUTESERVICE_API_KEY to the backend environment.",
      );
    }

    const baseUrl = env.OPENROUTESERVICE_BASE_URL.replace(/\/+$/, "");
    const endpoint = `${baseUrl}/directions/${profiles[mode]}/geojson`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
          Accept: "application/geo+json, application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [start.longitude, start.latitude],
            [destination.longitude, destination.latitude],
          ],
          instructions: true,
          language: "en",
        }),
        signal: AbortSignal.timeout(20_000),
      });
    } catch (error) {
      console.error("OpenRouteService request failed:", error instanceof Error ? error.message : error);
      throw new AppError(
        503,
        "ROUTING_UNAVAILABLE",
        "The routing service could not be reached. Check the backend internet connection and try again.",
      );
    }

    const payload = (await response.json().catch(() => ({}))) as OrsResponse;
    if (!response.ok) {
      const message = providerMessage(payload);
      console.error(`OpenRouteService rejected route (${response.status})${message ? `: ${message}` : ""}`);

      if (response.status === 401 || response.status === 403) {
        throw new AppError(
          502,
          "ROUTING_AUTH_FAILED",
          "OpenRouteService rejected the API key. Re-check OPENROUTESERVICE_API_KEY and make sure the token has Directions access.",
        );
      }

      if (response.status === 404) {
        throw new AppError(
          404,
          "ROUTE_NOT_FOUND",
          message || "No routable walking, cycling or driving path was found between these points.",
        );
      }

      throw new AppError(
        502,
        "ROUTE_NOT_FOUND",
        message || "A route could not be calculated between these locations.",
      );
    }

    const feature = payload.features?.[0];
    const coordinates = feature?.geometry?.coordinates;
    const summary = feature?.properties?.summary;
    if (!feature || !coordinates?.length || !summary) {
      throw new AppError(
        502,
        "INVALID_ROUTING_RESPONSE",
        "The routing service returned an incomplete route.",
      );
    }

    const steps = (feature.properties?.segments ?? [])
      .flatMap((segment) => segment.steps ?? [])
      .map((step) => ({
        instruction: step.instruction || "Continue",
        distanceMeters: step.distance ?? 0,
        durationSeconds: step.duration ?? 0,
        ...(step.name ? { streetName: step.name } : {}),
        ...(step.way_points ? { wayPoints: step.way_points } : {}),
      }));

    return {
      mode,
      distanceMeters: summary.distance ?? 0,
      durationSeconds: summary.duration ?? 0,
      geometry: coordinates.map(([longitude, latitude]) => [latitude, longitude]),
      steps,
    };
  },
};

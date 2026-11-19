/*
|--------------------------------------------------------------------------
| JewelMatch API Service
|--------------------------------------------------------------------------
| Catalogue API : Port 5000
| Matching API  : Port 5002
|
| Search modes:
|   all                -> Gold + Prototype
|   gold_to_prototype  -> Prototype only
|   prototype_to_gold  -> Gold only
|--------------------------------------------------------------------------
*/

// ---------------------------------------------------------
// 1. API CONFIGURATION
// ---------------------------------------------------------

function trimTrailingSlash(url = "") {
  return url.replace(/\/+$/, "");
}

const isDevelopment = import.meta.env.DEV;

export const MATCH_API_URL = trimTrailingSlash(
  import.meta.env.VITE_MATCH_API_URL || "http://46.202.167.86:5002",
);

export const CATALOGUE_API_URL = trimTrailingSlash(
  import.meta.env.VITE_CATALOGUE_API_URL ||
    (isDevelopment ? "http://127.0.0.1:5000" : ""),
);

// ---------------------------------------------------------
// 2. URL HELPERS
// ---------------------------------------------------------

function buildUrl(baseUrl, endpoint) {
  if (!baseUrl) {
    throw new Error(
      "API URL is missing. Please check your environment variables.",
    );
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  return `${baseUrl}${cleanEndpoint}`;
}

export function catalogueApiUrl(endpoint = "") {
  if (!endpoint) return CATALOGUE_API_URL;
  return buildUrl(CATALOGUE_API_URL, endpoint);
}

export function matchApiUrl(endpoint = "") {
  if (!endpoint) return MATCH_API_URL;
  return buildUrl(MATCH_API_URL, endpoint);
}

// Used by components such as SearchResults.jsx
export function apiUrl(endpoint = "") {
  return catalogueApiUrl(endpoint);
}

// ---------------------------------------------------------
// 3. COMMON FETCH HANDLER
// ---------------------------------------------------------

async function fetchWithErrorHandling(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error("API connection error:", error);

    throw new Error(
      "Unable to connect to the server. Please check your internet connection or API server.",
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(`Invalid server response. HTTP status: ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`,
    );
  }

  if (data?.success === false || data?.status === "error") {
    throw new Error(
      data?.message ||
        data?.error ||
        "The server could not complete the request.",
    );
  }

  return data;
}

// ---------------------------------------------------------
// 4. HEALTH CHECKS
// ---------------------------------------------------------

export async function checkHealth() {
  return fetchWithErrorHandling(catalogueApiUrl("/api/health"));
}

export async function checkModelHealth() {
  return fetchWithErrorHandling(matchApiUrl("/api/health"));
}

// Compatibility alias
export async function checkModel2Health() {
  return checkModelHealth();
}

// ---------------------------------------------------------
// 5. JEWELLERY TYPES
// ---------------------------------------------------------

export async function getJewelleryTypes() {
  return fetchWithErrorHandling(catalogueApiUrl("/api/jewellery-types"));
}

// ---------------------------------------------------------
// 6. MATCHING HELPERS
// ---------------------------------------------------------

function extractResults(data) {
  const results =
    data?.results ??
    data?.matches ??
    data?.items ??
    data?.data?.results ??
    data?.data?.matches ??
    [];

  return Array.isArray(results) ? results : [];
}

/*
 * Searches one target collection.
 *
 * IMPORTANT:
 * The matching API must support the multipart field
 * "source" as the target collection.
 */

async function matchBySource(image, source, topK) {
  const formData = new FormData();

  formData.append("image", image);
  formData.append("source", source);
  formData.append("top_k", String(topK));

  const data = await fetchWithErrorHandling(matchApiUrl("/api/match"), {
    method: "POST",
    body: formData,
  });

  const results = extractResults(data);

  return results.map((item) => ({
    ...item,
    collection: item.collection || source,
  }));
}

// ---------------------------------------------------------
// 7. MAIN JEWELLERY MATCHING FUNCTION
// ---------------------------------------------------------

export async function matchJewellery(image, searchMode = "all", topK = 10) {
  if (!image) {
    throw new Error("Please upload a jewellery image.");
  }

  const validModes = ["all", "gold_to_prototype", "prototype_to_gold"];

  if (!validModes.includes(searchMode)) {
    throw new Error("Invalid search mode selected.");
  }

  if (!Number.isInteger(topK) || topK < 1) {
    throw new Error("topK must be a positive integer.");
  }

  let targetCollections = [];

  switch (searchMode) {
    case "gold_to_prototype":
      targetCollections = ["prototype"];
      break;

    case "prototype_to_gold":
      targetCollections = ["gold"];
      break;

    case "all":
    default:
      targetCollections = ["gold", "prototype"];
      break;
  }

  console.log("Jewellery search mode:", searchMode);
  console.log("Target collections:", targetCollections);

  const collectionResults = await Promise.all(
    targetCollections.map((collection) =>
      matchBySource(image, collection, topK),
    ),
  );

  const results = collectionResults.flat();

  console.log("Total matching designs:", results.length);

  return {
    success: true,
    search_mode: searchMode,
    target_collections: targetCollections,
    total_results: results.length,
    results,
  };
}

// ---------------------------------------------------------
// 8. GET CATALOGUE
// ---------------------------------------------------------

export async function getCatalogue(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();

  const endpoint = queryString
    ? `/api/catalogue?${queryString}`
    : "/api/catalogue";

  return fetchWithErrorHandling(catalogueApiUrl(endpoint));
}

// ---------------------------------------------------------
// 9. GET SINGLE CATALOGUE ITEM
// ---------------------------------------------------------

export async function getCatalogueItem(id) {
  if (!id) {
    throw new Error("Jewellery ID is required.");
  }

  return fetchWithErrorHandling(
    catalogueApiUrl(`/api/catalogue/${encodeURIComponent(id)}`),
  );
}

// ---------------------------------------------------------
// 10. ADD JEWELLERY
// ---------------------------------------------------------

export async function addJewellery(jewelleryData) {
  if (!jewelleryData) {
    throw new Error("Jewellery data is required.");
  }

  const { image, name, collection, type, description = "" } = jewelleryData;

  // Validate image
  if (!(image instanceof Blob)) {
    throw new Error("Please select a valid jewellery image.");
  }

  // Validate name
  if (!name || !name.trim()) {
    throw new Error("Jewellery name is required.");
  }

  // Validate collection
  if (!collection) {
    throw new Error("Please select a collection.");
  }

  // Validate jewellery type
  if (!type) {
    throw new Error("Please select a jewellery type.");
  }

  // Create multipart FormData
  const formData = new FormData();

  formData.append("image", image, image.name || "jewellery.jpg");
  formData.append("name", name.trim());
  formData.append("collection", collection);
  formData.append("type", type);
  formData.append("description", description.trim());

  console.log("Submitting jewellery:", {
    name: name.trim(),
    collection,
    type,
    imageName: image.name,
    imageSize: image.size,
    imageType: image.type,
  });

  // Send to Flask Catalogue API
  return fetchWithErrorHandling(catalogueApiUrl("/api/jewellery/add"), {
    method: "POST",
    body: formData,
  });
}

// ---------------------------------------------------------
// 11. UPDATE JEWELLERY
// ---------------------------------------------------------

export async function updateJewellery(id, formData) {
  if (!id) {
    throw new Error("Jewellery ID is required.");
  }

  if (!formData) {
    throw new Error("Updated jewellery data is required.");
  }

  const options = {
    method: "PUT",
    body: formData,
  };

  return fetchWithErrorHandling(
    catalogueApiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
    options,
  );
}

// ---------------------------------------------------------
// 12. DELETE JEWELLERY
// ---------------------------------------------------------

export async function deleteJewellery(id) {
  if (!id) {
    throw new Error("Jewellery ID is required.");
  }

  return fetchWithErrorHandling(
    catalogueApiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
    {
      method: "DELETE",
    },
  );
}

// ---------------------------------------------------------
// 13. REBUILD MATCHING INDEX
// ---------------------------------------------------------

export async function rebuildIndex() {
  return fetchWithErrorHandling(matchApiUrl("/api/rebuild-index"), {
    method: "POST",
  });
}

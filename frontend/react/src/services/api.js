// // const API_BASE_URL =
// //   import.meta.env.VITE_API_BASE_URL ||
// //   "http://127.0.0.1:5000";
// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || window.location.origin;

// /* =========================================================
//    COMMON HELPERS
// ========================================================= */

// export function apiUrl(path) {
//   if (!path) return API_BASE_URL;

//   if (path.startsWith("http://") || path.startsWith("https://")) {
//     return path;
//   }

//   return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
// }

// async function parseResponse(response) {
//   let data = null;

//   try {
//     data = await response.json();
//   } catch {
//     data = null;
//   }

//   if (!response.ok) {
//     throw new Error(
//       data?.message || `Request failed with status ${response.status}.`,
//     );
//   }

//   if (data?.success === false) {
//     throw new Error(data.message || "The request could not be completed.");
//   }

//   return data;
// }

// /* =========================================================
//    HEALTH
// ========================================================= */

// export async function checkHealth() {
//   const response = await fetch(apiUrl("/api/health"));

//   return parseResponse(response);
// }

// /* =========================================================
//    JEWELLERY TYPES
// ========================================================= */

// export async function getJewelleryTypes() {
//   const response = await fetch(apiUrl("/api/jewellery-types"));

//   return parseResponse(response);
// }

// /* =========================================================
//    AI MATCHING
// ========================================================= */

// export async function matchJewellery(image, searchMode = "all", topK = 8) {
//   const formData = new FormData();

//   formData.append("image", image, image.name);

//   formData.append("search_mode", searchMode);

//   formData.append("top_k", String(topK));

//   const response = await fetch(apiUrl("/api/match"), {
//     method: "POST",
//     body: formData,
//   });

//   return parseResponse(response);
// }

// /* =========================================================
//    CATALOGUE
// ========================================================= */

// export async function getCatalogue({ collection = "all", search = "" } = {}) {
//   const params = new URLSearchParams();

//   if (collection && collection !== "all") {
//     params.set("collection", collection);
//   }

//   if (search.trim()) {
//     params.set("search", search.trim());
//   }

//   const query = params.toString();

//   const response = await fetch(
//     apiUrl(`/api/catalogue${query ? `?${query}` : ""}`),
//   );

//   return parseResponse(response);
// }

// /* =========================================================
//    SINGLE CATALOGUE ITEM
// ========================================================= */

// export async function getCatalogueItem(id) {
//   const response = await fetch(
//     apiUrl(`/api/catalogue/${encodeURIComponent(id)}`),
//   );

//   return parseResponse(response);
// }

// /* =========================================================
//    ADD JEWELLERY
// ========================================================= */

// export async function addJewellery({
//   image,
//   name,
//   collection,
//   type,
//   description,
// }) {
//   const formData = new FormData();

//   formData.append("image", image, image.name);

//   formData.append("name", name);

//   formData.append("collection", collection);

//   formData.append("type", type);

//   formData.append("description", description);

//   const response = await fetch(apiUrl("/api/jewellery/add"), {
//     method: "POST",
//     body: formData,
//   });

//   return parseResponse(response);
// }

// /* =========================================================
//    UPDATE JEWELLERY
// ========================================================= */

// export async function updateJewellery({
//   id,
//   image,
//   name,
//   collection,
//   type,
//   description,
// }) {
//   const formData = new FormData();

//   formData.append("name", name);

//   formData.append("collection", collection);

//   formData.append("type", type);

//   formData.append("description", description);

//   /*
//    * Image is optional during editing.
//    * If the user does not select a new image,
//    * the existing image remains unchanged.
//    */
//   if (image) {
//     formData.append("image", image, image.name);
//   }

//   const response = await fetch(
//     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
//     {
//       method: "POST",
//       body: formData,
//     },
//   );

//   return parseResponse(response);
// }

// /* =========================================================
//    DELETE JEWELLERY
// ========================================================= */

// export async function deleteJewellery(id) {
//   const response = await fetch(
//     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
//     {
//       method: "DELETE",
//     },
//   );

//   return parseResponse(response);
// }

// /* =========================================================
//    REBUILD INDEX
// ========================================================= */

// export async function rebuildIndex() {
//   const response = await fetch(apiUrl("/api/rebuild-index"), {
//     method: "POST",
//   });

//   return parseResponse(response);
// }

// render api model
// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || window.location.origin;

const MODEL_API_URL =
  import.meta.env.VITE_MODEL_API_URL ||
  "https://jewelmatchai-model.onrender.com";

// ============================================================
// COMMON HELPERS
// ============================================================

export function apiUrl(path) {
  if (!path) {
    return API_BASE_URL;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalisedPath = path.startsWith("/") ? path : "/" + path;

  return API_BASE_URL + normalisedPath;
}

async function parseResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Request failed with status " + response.status + ".",
    );
  }

  if (data?.success === false) {
    throw new Error(
      data.error || data.message || "The request could not be completed.",
    );
  }

  return data;
}

async function fetchWithErrorHandling(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error("API connection error:", error);

    throw new Error(
      "Unable to connect to the server. Please check your connection and try again.",
    );
  }

  return parseResponse(response);
}

// ============================================================
// MAIN APPLICATION HEALTH
// ============================================================

export async function checkHealth() {
  return fetchWithErrorHandling(apiUrl("/api/health"));
}

// ============================================================
// AI MODEL SERVICE HEALTH
// ============================================================

export async function checkModelHealth() {
  return fetchWithErrorHandling(MODEL_API_URL + "/api/health");
}

// ============================================================
// JEWELLERY TYPES
// ============================================================

export async function getJewelleryTypes() {
  return fetchWithErrorHandling(apiUrl("/api/jewellery-types"));
}

// ============================================================
// AI JEWELLERY MATCHING
//
// Supported search modes:
//   all                 -> Search both directions
//   gold_to_prototype   -> Gold input to Prototype catalogue
//   prototype_to_gold   -> Prototype input to Gold catalogue
// ============================================================

export async function matchJewellery(image, searchMode = "all", topK = 8) {
  if (!image) {
    throw new Error("Please upload or capture a jewellery image first.");
  }

  const validModes = ["all", "gold_to_prototype", "prototype_to_gold"];

  if (!validModes.includes(searchMode)) {
    throw new Error("Please select a valid jewellery search mode.");
  }

  async function matchBySource(source) {
    const formData = new FormData();

    formData.append("image", image, image.name || "jewellery-image.jpg");
    formData.append("source", source);
    formData.append("top_k", String(topK));

    const data = await fetchWithErrorHandling(MODEL_API_URL + "/api/match", {
      method: "POST",
      body: formData,
    });

    return {
      ...data,
      results: Array.isArray(data.results) ? data.results : [],
    };
  }

  // Gold image -> find similar prototype designs.
  if (searchMode === "gold_to_prototype") {
    const data = await matchBySource("gold");

    return {
      ...data,
      source: "gold",
      target: "prototype",
      results: data.results.map((item) => ({
        ...item,
        matched_collection: item.matched_collection || "prototype",
      })),
    };
  }

  // Prototype image -> find similar gold designs.
  if (searchMode === "prototype_to_gold") {
    const data = await matchBySource("prototype");

    return {
      ...data,
      source: "prototype",
      target: "gold",
      results: data.results.map((item) => ({
        ...item,
        matched_collection: item.matched_collection || "gold",
      })),
    };
  }

  // Search both directions and combine the results.
  const [goldData, prototypeData] = await Promise.all([
    matchBySource("gold"),
    matchBySource("prototype"),
  ]);

  const goldResults = goldData.results.map((item) => ({
    ...item,
    matched_collection: item.matched_collection || "prototype",
  }));

  const prototypeResults = prototypeData.results.map((item) => ({
    ...item,
    matched_collection: item.matched_collection || "gold",
  }));

  return {
    success: true,
    source: "all",
    results: [...goldResults, ...prototypeResults],
  };
}

// ============================================================
// CATALOGUE
// ============================================================

export async function getCatalogue({ collection = "all", search = "" } = {}) {
  const params = new URLSearchParams();

  if (collection && collection !== "all") {
    params.set("collection", collection);
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  const path = query ? "/api/catalogue?" + query : "/api/catalogue";

  return fetchWithErrorHandling(apiUrl(path));
}

// ============================================================
// GET SINGLE CATALOGUE ITEM
// ============================================================

export async function getCatalogueItem(id) {
  return fetchWithErrorHandling(
    apiUrl("/api/catalogue/" + encodeURIComponent(id)),
  );
}

// ============================================================
// ADD JEWELLERY
// ============================================================

export async function addJewellery({
  image,
  name,
  collection,
  type,
  description,
}) {
  if (!image) {
    throw new Error("Please select a jewellery image.");
  }

  const formData = new FormData();

  formData.append("image", image, image.name);
  formData.append("name", name);
  formData.append("collection", collection);
  formData.append("type", type);
  formData.append("description", description);

  return fetchWithErrorHandling(apiUrl("/api/jewellery/add"), {
    method: "POST",
    body: formData,
  });
}

// ============================================================
// UPDATE JEWELLERY
// ============================================================

export async function updateJewellery({
  id,
  image,
  name,
  collection,
  type,
  description,
}) {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("collection", collection);
  formData.append("type", type);
  formData.append("description", description);

  if (image) {
    formData.append("image", image, image.name);
  }

  return fetchWithErrorHandling(
    apiUrl("/api/jewellery/" + encodeURIComponent(id)),
    {
      method: "POST",
      body: formData,
    },
  );
}

// ============================================================
// DELETE JEWELLERY
// ============================================================

export async function deleteJewellery(id) {
  return fetchWithErrorHandling(
    apiUrl("/api/jewellery/" + encodeURIComponent(id)),
    {
      method: "DELETE",
    },
  );
}

// ============================================================
// REBUILD MATCHING INDEX
// ============================================================

export async function rebuildIndex() {
  return fetchWithErrorHandling(apiUrl("/api/rebuild-index"), {
    method: "POST",
  });
}

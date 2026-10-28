// // // const API_BASE_URL =
// // //   import.meta.env.VITE_API_BASE_URL ||
// // //   "http://127.0.0.1:5000";
// // const API_BASE_URL =
// //   import.meta.env.VITE_API_BASE_URL || window.location.origin;

// // /* =========================================================
// //    COMMON HELPERS
// // ========================================================= */

// // export function apiUrl(path) {
// //   if (!path) return API_BASE_URL;

// //   if (path.startsWith("http://") || path.startsWith("https://")) {
// //     return path;
// //   }

// //   return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
// // }

// // async function parseResponse(response) {
// //   let data = null;

// //   try {
// //     data = await response.json();
// //   } catch {
// //     data = null;
// //   }

// //   if (!response.ok) {
// //     throw new Error(
// //       data?.message || `Request failed with status ${response.status}.`,
// //     );
// //   }

// //   if (data?.success === false) {
// //     throw new Error(data.message || "The request could not be completed.");
// //   }

// //   return data;
// // }

// // /* =========================================================
// //    HEALTH
// // ========================================================= */

// // export async function checkHealth() {
// //   const response = await fetch(apiUrl("/api/health"));

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    JEWELLERY TYPES
// // ========================================================= */

// // export async function getJewelleryTypes() {
// //   const response = await fetch(apiUrl("/api/jewellery-types"));

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    AI MATCHING
// // ========================================================= */

// // export async function matchJewellery(image, searchMode = "all", topK = 8) {
// //   const formData = new FormData();

// //   formData.append("image", image, image.name);

// //   formData.append("search_mode", searchMode);

// //   formData.append("top_k", String(topK));

// //   const response = await fetch(apiUrl("/api/match"), {
// //     method: "POST",
// //     body: formData,
// //   });

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    CATALOGUE
// // ========================================================= */

// // export async function getCatalogue({ collection = "all", search = "" } = {}) {
// //   const params = new URLSearchParams();

// //   if (collection && collection !== "all") {
// //     params.set("collection", collection);
// //   }

// //   if (search.trim()) {
// //     params.set("search", search.trim());
// //   }

// //   const query = params.toString();

// //   const response = await fetch(
// //     apiUrl(`/api/catalogue${query ? `?${query}` : ""}`),
// //   );

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    SINGLE CATALOGUE ITEM
// // ========================================================= */

// // export async function getCatalogueItem(id) {
// //   const response = await fetch(
// //     apiUrl(`/api/catalogue/${encodeURIComponent(id)}`),
// //   );

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    ADD JEWELLERY
// // ========================================================= */

// // export async function addJewellery({
// //   image,
// //   name,
// //   collection,
// //   type,
// //   description,
// // }) {
// //   const formData = new FormData();

// //   formData.append("image", image, image.name);

// //   formData.append("name", name);

// //   formData.append("collection", collection);

// //   formData.append("type", type);

// //   formData.append("description", description);

// //   const response = await fetch(apiUrl("/api/jewellery/add"), {
// //     method: "POST",
// //     body: formData,
// //   });

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    UPDATE JEWELLERY
// // ========================================================= */

// // export async function updateJewellery({
// //   id,
// //   image,
// //   name,
// //   collection,
// //   type,
// //   description,
// // }) {
// //   const formData = new FormData();

// //   formData.append("name", name);

// //   formData.append("collection", collection);

// //   formData.append("type", type);

// //   formData.append("description", description);

// //   /*
// //    * Image is optional during editing.
// //    * If the user does not select a new image,
// //    * the existing image remains unchanged.
// //    */
// //   if (image) {
// //     formData.append("image", image, image.name);
// //   }

// //   const response = await fetch(
// //     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
// //     {
// //       method: "POST",
// //       body: formData,
// //     },
// //   );

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    DELETE JEWELLERY
// // ========================================================= */

// // export async function deleteJewellery(id) {
// //   const response = await fetch(
// //     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
// //     {
// //       method: "DELETE",
// //     },
// //   );

// //   return parseResponse(response);
// // }

// // /* =========================================================
// //    REBUILD INDEX
// // ========================================================= */

// // export async function rebuildIndex() {
// //   const response = await fetch(apiUrl("/api/rebuild-index"), {
// //     method: "POST",
// //   });

// //   return parseResponse(response);
// // }

// // render api model
// // ============================================================
// // API CONFIGURATION
// // ============================================================

// // ###############################################
// // 2model integration
// // ##########################################

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || window.location.origin;

// // Model 1 — existing jewellery matcher
// const MODEL_API_URL =
//   import.meta.env.VITE_MODEL_API_URL ||
//   "https://jewelmatchai-model.onrender.com";

// // Model 2 — Segmented DINOv2 ONNX matcher
// const MODEL2_API_URL =
//   import.meta.env.VITE_MODEL2_API_URL ||
//   "https://jewelmatchai-model-1.onrender.com";

// // ============================================================
// // COMMON HELPERS
// // ============================================================

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
//       data?.error ||
//         data?.message ||
//         `Request failed with status ${response.status}.`,
//     );
//   }

//   if (data?.success === false || data?.status === "error") {
//     throw new Error(
//       data.error || data.message || "The request could not be completed.",
//     );
//   }

//   return data;
// }
// async function fetchWithErrorHandling(url, options = {}) {
//   console.log("[API REQUEST]", options.method || "GET", url);

//   let response;

//   try {
//     response = await fetch(url, options);
//   } catch (error) {
//     console.error("[API NETWORK ERROR]", {
//       url,
//       name: error.name,
//       message: error.message,
//       error,
//     });

//     throw new Error(
//       `Request failed: ${error.message}. Check the browser console and Network tab.`,
//     );
//   }

//   console.log("[API STATUS]", response.status, url);

//   let data;

//   try {
//     data = await response.json();
//   } catch {
//     throw new Error(
//       `Server returned an unreadable response (HTTP ${response.status}).`,
//     );
//   }

//   console.log("[API BODY]", url, data);

//   if (!response.ok) {
//     throw new Error(
//       data?.message ||
//         data?.error ||
//         `Request failed with HTTP ${response.status}.`,
//     );
//   }

//   if (data?.success === false || data?.status === "error") {
//     throw new Error(
//       data.message || data.error || "The request could not be completed.",
//     );
//   }

//   return data;
// }

// // ============================================================
// // HEALTH
// // ============================================================

// export async function checkHealth() {
//   return fetchWithErrorHandling(apiUrl("/api/health"));
// }

// export async function checkModelHealth() {
//   return fetchWithErrorHandling(`${MODEL_API_URL}/api/health`);
// }

// export async function checkModel2Health() {
//   return fetchWithErrorHandling(`${MODEL2_API_URL}/api/health`);
// }

// // ============================================================
// // JEWELLERY TYPES
// // ============================================================

// export async function getJewelleryTypes() {
//   return fetchWithErrorHandling(apiUrl("/api/jewellery-types"));
// }

// // ============================================================
// // MATCHING HELPERS
// // ============================================================

// async function matchWithModel(modelUrl, image, source, topK, modelName) {
//   const formData = new FormData();

//   formData.append("image", image, image.name || "jewellery-image.jpg");
//   formData.append("source", source);
//   formData.append("top_k", String(topK));

//   const data = await fetchWithErrorHandling(`${modelUrl}/api/match`, {
//     method: "POST",
//     body: formData,
//   });

//   // Model 1 returns results; Model 2 may return matches.
//   const items = Array.isArray(data.results)
//     ? data.results
//     : Array.isArray(data.matches)
//       ? data.matches
//       : [];

//   const target = data.target || (source === "gold" ? "prototype" : "gold");

//   return {
//     success: true,
//     source,
//     target,
//     model: modelName,
//     results: items.slice(0, topK).map((item) => {
//       const score = Number(item.score);
//       const similarity =
//         item.similarity_percent != null
//           ? Number(item.similarity_percent)
//           : Number.isFinite(score)
//             ? score <= 1
//               ? score * 100
//               : score
//             : null;

//       return {
//         ...item,
//         model: modelName,
//         source,
//         target,
//         matched_collection: item.matched_collection || target,
//         similarity_percent: similarity == null ? null : similarity,
//       };
//     }),
//   };
// }

// async function safelyMatchWithModel(modelUrl, image, source, topK, modelName) {
//   try {
//     return await matchWithModel(modelUrl, image, source, topK, modelName);
//   } catch (error) {
//     console.error(`${modelName} matching error:`, error);

//     return {
//       success: false,
//       source,
//       target: source === "gold" ? "prototype" : "gold",
//       model: modelName,
//       results: [],
//       error: error.message || `${modelName} is unavailable.`,
//     };
//   }
// }

// // ============================================================
// // AI JEWELLERY MATCHING — MODEL 1 + MODEL 2
// //
// // searchMode:
// //   all                 -> Both search directions
// //   gold_to_prototype   -> Gold image to Prototype catalogue
// //   prototype_to_gold   -> Prototype image to Gold catalogue
// //
// // Both models run independently.
// // Each model returns up to topK matches per direction.
// // ============================================================

// export async function matchJewellery(image, searchMode = "all", topK = 10) {
//   if (!image) {
//     throw new Error("Please upload or capture a jewellery image first.");
//   }

//   const validModes = ["all", "gold_to_prototype", "prototype_to_gold"];

//   if (!validModes.includes(searchMode)) {
//     throw new Error("Please select a valid jewellery search mode.");
//   }

//   const directions =
//     searchMode === "all"
//       ? [
//           { source: "gold", target: "prototype" },
//           { source: "prototype", target: "gold" },
//         ]
//       : [
//           {
//             source: searchMode === "gold_to_prototype" ? "gold" : "prototype",
//             target: searchMode === "gold_to_prototype" ? "prototype" : "gold",
//           },
//         ];

//   const tasks = directions.flatMap(({ source }) => [
//     safelyMatchWithModel(MODEL_API_URL, image, source, topK, "Model 1"),
//     safelyMatchWithModel(MODEL2_API_URL, image, source, topK, "Model 2"),
//   ]);

//   // Individual failures are caught inside safelyMatchWithModel.
//   const responses = await Promise.all(tasks);

//   const model1 = [];
//   const model2 = [];
//   const errors = [];

//   for (const response of responses) {
//     if (response.model === "Model 1") {
//       model1.push(...response.results);
//     } else {
//       model2.push(...response.results);
//     }

//     if (response.error) {
//       errors.push({
//         model: response.model,
//         source: response.source,
//         message: response.error,
//       });
//     }
//   }

//   return {
//     success: model1.length > 0 || model2.length > 0,
//     source: searchMode,

//     // Separate result sets for the React UI.
//     model1,
//     model2,

//     // Errors are reported separately, so one model can still work.
//     errors,

//     // Backwards compatibility for components using data.results.
//     results: [...model1, ...model2],
//   };
// }

// // ============================================================
// // CATALOGUE
// // ============================================================

// export async function getCatalogue({ collection = "all", search = "" } = {}) {
//   const params = new URLSearchParams();

//   if (collection && collection !== "all") {
//     params.set("collection", collection);
//   }

//   if (search.trim()) {
//     params.set("search", search.trim());
//   }

//   const query = params.toString();
//   const path = query ? `/api/catalogue?${query}` : "/api/catalogue";

//   return fetchWithErrorHandling(apiUrl(path));
// }

// // ============================================================
// // GET SINGLE CATALOGUE ITEM
// // ============================================================

// export async function getCatalogueItem(id) {
//   return fetchWithErrorHandling(
//     apiUrl(`/api/catalogue/${encodeURIComponent(id)}`),
//   );
// }

// // ============================================================
// // ADD JEWELLERY
// // ============================================================

// export async function addJewellery({
//   image,
//   name,
//   collection,
//   type,
//   description,
// }) {
//   if (!image) {
//     throw new Error("Please select a jewellery image.");
//   }

//   const formData = new FormData();

//   formData.append("image", image, image.name);
//   formData.append("name", name);
//   formData.append("collection", collection);
//   formData.append("type", type);
//   formData.append("description", description);

//   return fetchWithErrorHandling(apiUrl("/api/jewellery/add"), {
//     method: "POST",
//     body: formData,
//   });
// }

// // ============================================================
// // UPDATE JEWELLERY
// // ============================================================

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

//   if (image) {
//     formData.append("image", image, image.name);
//   }

//   return fetchWithErrorHandling(
//     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
//     {
//       method: "POST",
//       body: formData,
//     },
//   );
// }

// // ============================================================
// // DELETE JEWELLERY
// // ============================================================

// export async function deleteJewellery(id) {
//   return fetchWithErrorHandling(
//     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
//     {
//       method: "DELETE",
//     },
//   );
// }

// // ============================================================
// // REBUILD MATCHING INDEX
// // ============================================================

// export async function rebuildIndex() {
//   return fetchWithErrorHandling(apiUrl("/api/rebuild-index"), {
//     method: "POST",
//   });
// }
//

// new api.js

/* ============================================================
   JEWELLERY MATCHER V3 — SINGLE API CONFIGURATION
   Uses the new deployed Flask backend only.
   ============================================================ */

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://46.202.167.86:8088";

// /* ============================================================
//    COMMON HELPERS
//    ============================================================ */

// export function apiUrl(path = "") {
//   if (!path) return API_BASE_URL;

//   if (/^https?:\/\//i.test(path)) {
//     return path;
//   }

//   return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
// }

// async function fetchWithErrorHandling(url, options = {}) {
//   console.log("[API REQUEST]", options.method || "GET", url);

//   let response;

//   try {
//     response = await fetch(url, options);
//   } catch (error) {
//     console.error("[API NETWORK ERROR]", error);

//     throw new Error(
//       `Unable to connect to ${url}. Check the deployed server, network, and CORS settings.`,
//     );
//   }

//   console.log("[API STATUS]", response.status, url);

//   let data;

//   try {
//     data = await response.json();
//   } catch {
//     throw new Error(
//       `The server returned an unreadable response (HTTP ${response.status}) for ${url}.`,
//     );
//   }

//   console.log("[API BODY]", data);

//   if (!response.ok) {
//     throw new Error(
//       data?.error ||
//         data?.message ||
//         `Request failed with HTTP ${response.status}.`,
//     );
//   }

//   if (data?.success === false || data?.status === "error") {
//     throw new Error(
//       data?.error || data?.message || "The request could not be completed.",
//     );
//   }

//   return data;
// }

// /* ============================================================
//    HEALTH CHECK
//    ============================================================ */

// export async function checkHealth() {
//   return fetchWithErrorHandling(apiUrl("/api/health"));
// }

// /* ============================================================
//    JEWELLERY TYPES
//    ============================================================ */

// export async function getJewelleryTypes() {
//   return fetchWithErrorHandling(apiUrl("/api/jewellery-types"));
// }

// /* ============================================================
//    AI JEWELLERY MATCHING — SINGLE DEPLOYED MODEL

//    searchMode:
//    all                 -> Search both directions
//    gold_to_prototype   -> Gold to Prototype
//    prototype_to_gold   -> Prototype to Gold

//    The deployed model is called once per requested direction.
//    ============================================================ */

// export async function matchJewellery(image, searchMode = "all", topK = 10) {
//   if (!image) {
//     throw new Error("Please upload or capture a jewellery image first.");
//   }

//   const validModes = ["all", "gold_to_prototype", "prototype_to_gold"];

//   if (!validModes.includes(searchMode)) {
//     throw new Error("Please select a valid jewellery search mode.");
//   }

//   const parsedTopK = Number(topK);

//   if (!Number.isInteger(parsedTopK) || parsedTopK < 1) {
//     throw new Error("The number of matches must be a positive integer.");
//   }

//   const directions =
//     searchMode === "all"
//       ? ["gold", "prototype"]
//       : [searchMode === "gold_to_prototype" ? "gold" : "prototype"];

//   const responses = await Promise.all(
//     directions.map(async (source) => {
//       const formData = new FormData();

//       formData.append("image", image, image.name || "jewellery-image.jpg");

//       formData.append("source", source);
//       formData.append("top_k", String(parsedTopK));

//       const data = await fetchWithErrorHandling(apiUrl("/api/match"), {
//         method: "POST",
//         body: formData,
//       });

//       const items = Array.isArray(data?.results)
//         ? data.results
//         : Array.isArray(data?.matches)
//           ? data.matches
//           : [];

//       const target = data?.target || (source === "gold" ? "prototype" : "gold");

//       return {
//         source,
//         target,
//         results: items.slice(0, parsedTopK).map((item) => {
//           const rawScore =
//             item?.similarity_percent ??
//             item?.similarity ??
//             item?.score ??
//             item?.match_score ??
//             item?.similarity_score;

//           const numericScore =
//             rawScore === undefined || rawScore === null
//               ? null
//               : Number(rawScore);

//           let similarity = null;

//           if (numericScore !== null && Number.isFinite(numericScore)) {
//             similarity =
//               rawScore === item?.similarity_percent ||
//               rawScore === item?.similarity
//                 ? numericScore
//                 : numericScore <= 1
//                   ? numericScore * 100
//                   : numericScore;
//           }

//           return {
//             ...item,
//             source,
//             target,
//             model: "Deployed Model",
//             matched_collection: item?.matched_collection || target,
//             similarity_percent: similarity,
//           };
//         }),
//       };
//     }),
//   );

//   const results = responses.flatMap((response) =>
//     response.results.map((item) => ({
//       ...item,
//       source: response.source,
//       target: response.target,
//     })),
//   );

//   return {
//     success: results.length > 0,
//     source: searchMode,
//     model: "Deployed Model",
//     results,
//     model1: results,
//     model2: [],
//     errors: [],
//   };
// }

// /* ============================================================
//    CATALOGUE
//    ============================================================ */

// export async function getCatalogue({ collection = "all", search = "" } = {}) {
//   const params = new URLSearchParams();

//   if (collection && collection !== "all") {
//     params.set("collection", collection);
//   }

//   if (typeof search === "string" && search.trim()) {
//     params.set("search", search.trim());
//   }

//   const query = params.toString();

//   return fetchWithErrorHandling(
//     apiUrl(`/api/catalogue${query ? `?${query}` : ""}`),
//   );
// }

// /* ============================================================
//    GET SINGLE CATALOGUE ITEM
//    ============================================================ */

// export async function getCatalogueItem(id) {
//   return fetchWithErrorHandling(
//     apiUrl(`/api/catalogue/${encodeURIComponent(id)}`),
//   );
// }

// /* ============================================================
//    ADD JEWELLERY
//    ============================================================ */

// export async function addJewellery({
//   image,
//   name,
//   collection,
//   type,
//   description,
// }) {
//   if (!image) {
//     throw new Error("Please select a jewellery image.");
//   }

//   const formData = new FormData();

//   formData.append("image", image, image.name || "jewellery-image.jpg");
//   formData.append("name", name ?? "");
//   formData.append("collection", collection ?? "");
//   formData.append("type", type ?? "");
//   formData.append("description", description ?? "");

//   return fetchWithErrorHandling(apiUrl("/api/jewellery/add"), {
//     method: "POST",
//     body: formData,
//   });
// }

// /* ============================================================
//    UPDATE JEWELLERY
//    ============================================================ */

// export async function updateJewellery({
//   id,
//   image,
//   name,
//   collection,
//   type,
//   description,
// }) {
//   const formData = new FormData();

//   formData.append("name", name ?? "");
//   formData.append("collection", collection ?? "");
//   formData.append("type", type ?? "");
//   formData.append("description", description ?? "");

//   if (image) {
//     formData.append("image", image, image.name || "jewellery-image.jpg");
//   }

//   return fetchWithErrorHandling(
//     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
//     {
//       method: "POST",
//       body: formData,
//     },
//   );
// }

// /* ============================================================
//    DELETE JEWELLERY
//    ============================================================ */

// export async function deleteJewellery(id) {
//   return fetchWithErrorHandling(
//     apiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
//     {
//       method: "DELETE",
//     },
//   );
// }

// /* ============================================================
//    REBUILD MATCHING INDEX
//    ============================================================ */

// export async function rebuildIndex() {
//   return fetchWithErrorHandling(apiUrl("/api/rebuild-index"), {
//     method: "POST",
//   });
// }

// ################################################

/*
 * Jewellery Matcher V3 — API configuration
 *
 * AI matching: new deployed model
 * Catalogue: separate catalogue backend
 *
 * Configure these URLs in frontend/react/.env.local
 *
 * VITE_MATCH_API_URL=http://46.202.167.86:8088
 * VITE_CATALOGUE_API_URL=http://127.0.0.1:5000
 *
 * IMPORTANT:
 * localhost works only if the catalogue backend is running
 * on the same computer as the browser.
 */

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const MATCH_API_URL = trimTrailingSlash(
  import.meta.env.VITE_MATCH_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://46.202.167.86:8088",
);

export const CATALOGUE_API_URL = trimTrailingSlash(
  import.meta.env.VITE_CATALOGUE_API_URL || "http://127.0.0.1:5000",
);

function buildUrl(baseUrl, path = "") {
  if (!path) return baseUrl;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function catalogueApiUrl(path = "") {
  return buildUrl(CATALOGUE_API_URL, path);
}

export function matchApiUrl(path = "") {
  return buildUrl(MATCH_API_URL, path);
}

// Backwards compatibility for existing components.
export function apiUrl(path = "") {
  return catalogueApiUrl(path);
}

async function fetchWithErrorHandling(url, options = {}) {
  console.log("[API REQUEST]", options.method || "GET", url);

  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error("[API NETWORK ERROR]", { url, error });

    throw new Error(
      `Unable to connect to ${url}. Check the server URL, network, and CORS settings.`,
    );
  }

  console.log("[API STATUS]", response.status, url);

  const rawBody = await response.text();
  let data = null;

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      if (response.ok) {
        throw new Error(
          `The server returned a non-JSON response (HTTP ${response.status}) for ${url}.`,
        );
      }
    }
  }

  console.log("[API BODY]", url, data ?? rawBody);

  if (!response.ok) {
    const message =
      data?.error || data?.message || data?.detail || rawBody.slice(0, 250);

    throw new Error(
      message
        ? `HTTP ${response.status}: ${message}`
        : `Request failed with HTTP ${response.status} for ${url}.`,
    );
  }

  if (data?.success === false || data?.status === "error") {
    throw new Error(
      data?.error || data?.message || "The request could not be completed.",
    );
  }

  return data;
}

/* ============================================================
   HEALTH CHECKS
   ============================================================ */

// Catalogue/backend health.
export async function checkHealth() {
  return fetchWithErrorHandling(catalogueApiUrl("/api/health"));
}

// New deployed matching model health.
export async function checkModelHealth() {
  return fetchWithErrorHandling(matchApiUrl("/api/health"));
}

// Compatibility with components using the old function name.
export async function checkModel2Health() {
  return checkModelHealth();
}

/* ============================================================
   JEWELLERY TYPES
   ============================================================ */

export async function getJewelleryTypes() {
  return fetchWithErrorHandling(catalogueApiUrl("/api/jewellery-types"));
}

/* ============================================================
   AI JEWELLERY MATCHING
   New deployed model
   ============================================================ */

export async function matchJewellery(image, searchMode = "all", topK = 10) {
  if (!image) {
    throw new Error("Please upload or capture a jewellery image first.");
  }

  const validModes = ["all", "gold_to_prototype", "prototype_to_gold"];

  if (!validModes.includes(searchMode)) {
    throw new Error("Please select a valid jewellery search mode.");
  }

  const parsedTopK = Number(topK);

  if (!Number.isInteger(parsedTopK) || parsedTopK < 1) {
    throw new Error("The number of matches must be a positive integer.");
  }

  const sources =
    searchMode === "all"
      ? ["gold", "prototype"]
      : [searchMode === "gold_to_prototype" ? "gold" : "prototype"];

  const responses = await Promise.all(
    sources.map(async (source) => {
      const formData = new FormData();

      formData.append("image", image, image.name || "jewellery-image.jpg");

      formData.append("source", source);
      formData.append("top_k", String(parsedTopK));

      const data = await fetchWithErrorHandling(matchApiUrl("/api/match"), {
        method: "POST",
        body: formData,
      });

      const items = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.matches)
          ? data.matches
          : [];

      const target = data?.target || (source === "gold" ? "prototype" : "gold");

      const results = items.slice(0, parsedTopK).map((item) => {
        const rawScore =
          item?.similarity_percent ??
          item?.similarity ??
          item?.score ??
          item?.match_score ??
          item?.similarity_score;

        const numericScore =
          rawScore === undefined || rawScore === null ? null : Number(rawScore);

        let similarity = null;

        if (numericScore !== null && Number.isFinite(numericScore)) {
          similarity =
            item?.similarity_percent != null || item?.similarity != null
              ? numericScore
              : numericScore <= 1
                ? numericScore * 100
                : numericScore;
        }

        return {
          ...item,
          source,
          target,
          model: "Deployed Model",
          matched_collection: item?.matched_collection || target,
          similarity_percent: similarity,
        };
      });

      return {
        source,
        target,
        results,
      };
    }),
  );

  const results = responses.flatMap((response) =>
    response.results.map((item) => ({
      ...item,
      source: response.source,
      target: response.target,
    })),
  );

  return {
    success: results.length > 0,
    source: searchMode,
    model: "Deployed Model",
    results,
    model1: results,
    model2: [],
    errors: [],
  };
}

/* ============================================================
   CATALOGUE
   ============================================================ */

export async function getCatalogue({ collection = "all", search = "" } = {}) {
  const params = new URLSearchParams();

  if (collection && collection !== "all") {
    params.set("collection", collection);
  }

  if (typeof search === "string" && search.trim()) {
    params.set("search", search.trim());
  }

  const query = params.toString();

  const path = `/api/catalogue${query ? `?${query}` : ""}`;

  return fetchWithErrorHandling(catalogueApiUrl(path));
}

/* ============================================================
   GET SINGLE CATALOGUE ITEM
   ============================================================ */

export async function getCatalogueItem(id) {
  return fetchWithErrorHandling(
    catalogueApiUrl(`/api/catalogue/${encodeURIComponent(id)}`),
  );
}

/* ============================================================
   ADD JEWELLERY
   ============================================================ */

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

  formData.append("image", image, image.name || "jewellery-image.jpg");

  formData.append("name", name ?? "");
  formData.append("collection", collection ?? "");
  formData.append("type", type ?? "");
  formData.append("description", description ?? "");

  return fetchWithErrorHandling(catalogueApiUrl("/api/jewellery/add"), {
    method: "POST",
    body: formData,
  });
}

/* ============================================================
   UPDATE JEWELLERY
   ============================================================ */

export async function updateJewellery({
  id,
  image,
  name,
  collection,
  type,
  description,
}) {
  if (id === undefined || id === null || id === "") {
    throw new Error("A jewellery item ID is required to update an item.");
  }

  const formData = new FormData();

  formData.append("name", name ?? "");
  formData.append("collection", collection ?? "");
  formData.append("type", type ?? "");
  formData.append("description", description ?? "");

  // Image is optional when editing.
  if (image) {
    formData.append("image", image, image.name || "jewellery-image.jpg");
  }

  return fetchWithErrorHandling(
    catalogueApiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
    {
      method: "POST",
      body: formData,
    },
  );
}

/* ============================================================
   DELETE JEWELLERY
   ============================================================ */

export async function deleteJewellery(id) {
  if (id === undefined || id === null || id === "") {
    throw new Error("A jewellery item ID is required to delete an item.");
  }

  return fetchWithErrorHandling(
    catalogueApiUrl(`/api/jewellery/${encodeURIComponent(id)}`),
    {
      method: "DELETE",
    },
  );
}

/* ============================================================
   REBUILD MATCHING INDEX
   ============================================================ */

export async function rebuildIndex() {
  return fetchWithErrorHandling(matchApiUrl("/api/rebuild-index"), {
    method: "POST",
  });
}

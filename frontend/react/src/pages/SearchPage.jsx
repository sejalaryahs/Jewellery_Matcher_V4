// // // // import { useEffect, useState } from "react";
// // // // import { Link } from "react-router-dom";

// // // // import Header from "../components/Header";
// // // // import SearchModeSelector from "../components/SearchModeSelector";
// // // // import ImageUpload from "../components/ImageUpload";

// // // // import { matchJewellery, apiUrl } from "../services/api";

// // // // import "../styles/search.css";

// // // // function SearchPage() {
// // // //   const [searchMode, setSearchMode] = useState("all");
// // // //   const [selectedImage, setSelectedImage] = useState(null);
// // // //   const [message, setMessage] = useState("");
// // // //   const [results, setResults] = useState([]);
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [hasSearched, setHasSearched] = useState(false);
// // // //   const [selectedResult, setSelectedResult] = useState(null);

// // // //   function handleImageChange(image) {
// // // //     setSelectedImage(image);
// // // //     setMessage("");
// // // //     setResults([]);
// // // //     setHasSearched(false);
// // // //     closeResultDetails();
// // // //   }

// // // //   function handleSearchModeChange(mode) {
// // // //     setSearchMode(mode);
// // // //     setMessage("");
// // // //     setResults([]);
// // // //     setHasSearched(false);
// // // //     closeResultDetails();
// // // //   }

// // // //   async function handleSearch() {
// // // //     if (!selectedImage) {
// // // //       setMessage("Please upload or capture a jewellery image first.");
// // // //       return;
// // // //     }

// // // //     if (loading) return;

// // // //     setLoading(true);
// // // //     setMessage("Analysing your jewellery image and finding similar designs...");
// // // //     setResults([]);
// // // //     setHasSearched(false);
// // // //     closeResultDetails();

// // // //     try {
// // // //       const data = await matchJewellery(selectedImage, searchMode, 12);
// // // //       const matchedResults = Array.isArray(data?.results) ? data.results : [];

// // // //       setResults(matchedResults);
// // // //       setHasSearched(true);

// // // //       if (matchedResults.length === 0) {
// // // //         setMessage(
// // // //           "No similar jewellery designs were found. Try another image or search mode.",
// // // //         );
// // // //       } else {
// // // //         setMessage(
// // // //           `Search complete. Found ${matchedResults.length} matching design(s).`,
// // // //         );
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Jewellery matching error:", error);

// // // //       setMessage(
// // // //         error.message ||
// // // //           "Unable to complete the jewellery search. Please try again.",
// // // //       );
// // // //       setHasSearched(true);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   }

// // // //   function getSimilarity(item) {
// // // //     const rawScore =
// // // //       item.similarity ??
// // // //       item.score ??
// // // //       item.match_score ??
// // // //       item.similarity_score;

// // // //     if (rawScore === undefined || rawScore === null) {
// // // //       return null;
// // // //     }

// // // //     const numericScore = Number(rawScore);

// // // //     if (!Number.isFinite(numericScore)) {
// // // //       return null;
// // // //     }

// // // //     const percentage =
// // // //       numericScore >= 0 && numericScore <= 1
// // // //         ? numericScore * 100
// // // //         : numericScore;

// // // //     return Math.max(0, Math.min(100, percentage));
// // // //   }

// // // //   function getImageUrl(item) {
// // // //     const imageValue =
// // // //       item.image_url ||
// // // //       item.image ||
// // // //       item.image_path ||
// // // //       item.filename ||
// // // //       item.image_filename;

// // // //     if (!imageValue || typeof imageValue !== "string") {
// // // //       return null;
// // // //     }

// // // //     if (/^https?:\/\//i.test(imageValue)) {
// // // //       return imageValue;
// // // //     }

// // // //     const gridFsId =
// // // //       item.image_gridfs_id ||
// // // //       item.gridfs_id ||
// // // //       item.image_id ||
// // // //       item.image_file_id;

// // // //     if (gridFsId) {
// // // //       return `https://jewelmatchai-model.onrender.com/catalogue-image/stored/${encodeURIComponent(
// // // //         gridFsId,
// // // //       )}`;
// // // //     }

// // // //     const normalisedPath = imageValue.replace(/\\/g, "/");

// // // //     if (normalisedPath.includes("/catalogue/")) {
// // // //       const cataloguePath = normalisedPath.split("/catalogue/").pop();

// // // //       if (cataloguePath) {
// // // //         return `https://jewelmatchai-model.onrender.com/catalogue/${cataloguePath
// // // //           .split("/")
// // // //           .map(encodeURIComponent)
// // // //           .join("/")}`;
// // // //       }
// // // //     }

// // // //     if (normalisedPath.startsWith("/")) {
// // // //       return apiUrl(normalisedPath);
// // // //     }

// // // //     const collection =
// // // //       item.matched_collection || item.collection || item.source_collection;

// // // //     if (
// // // //       collection &&
// // // //       ["gold", "prototype", "prototypes"].includes(
// // // //         String(collection).toLowerCase(),
// // // //       )
// // // //     ) {
// // // //       const domain =
// // // //         String(collection).toLowerCase() === "gold" ? "gold" : "prototypes";

// // // //       const filename = normalisedPath.split("/").pop();

// // // //       return `https://jewelmatchai-model.onrender.com/catalogue/${domain}/${encodeURIComponent(
// // // //         filename,
// // // //       )}`;
// // // //     }

// // // //     return null;
// // // //   }

// // // //   function getItemName(item, index) {
// // // //     return (
// // // //       item.name ||
// // // //       item.jewellery_name ||
// // // //       item.design_name ||
// // // //       item.title ||
// // // //       item.id ||
// // // //       item.jewellery_id ||
// // // //       `Matching Design ${index + 1}`
// // // //     );
// // // //   }

// // // //   function getItemId(item) {
// // // //     return (
// // // //       item.design_id ||
// // // //       item.jewellery_id ||
// // // //       item.item_id ||
// // // //       item.id ||
// // // //       item.code ||
// // // //       item._id ||
// // // //       ""
// // // //     );
// // // //   }

// // // //   function getCollection(item) {
// // // //     const collection =
// // // //       item.matched_collection ||
// // // //       item.collection ||
// // // //       item.source_collection ||
// // // //       "";

// // // //     if (!collection) return "";

// // // //     const normalised = String(collection).toLowerCase();

// // // //     if (normalised === "prototype" || normalised === "prototypes") {
// // // //       return "Prototype";
// // // //     }

// // // //     if (normalised === "gold") {
// // // //       return "Gold";
// // // //     }

// // // //     return String(collection);
// // // //   }

// // // //   function openResultDetails(item) {
// // // //     setSelectedResult(item);
// // // //     document.body.classList.add("catalogue-overlay-open");
// // // //   }

// // // //   function closeResultDetails() {
// // // //     setSelectedResult(null);
// // // //     document.body.classList.remove("catalogue-overlay-open");
// // // //   }

// // // //   useEffect(() => {
// // // //     function handleEscape(event) {
// // // //       if (event.key === "Escape") {
// // // //         closeResultDetails();
// // // //       }
// // // //     }

// // // //     document.addEventListener("keydown", handleEscape);

// // // //     return () => {
// // // //       document.removeEventListener("keydown", handleEscape);
// // // //       document.body.classList.remove("catalogue-overlay-open");
// // // //     };
// // // //   }, []);

// // // //   const selectedResultImageUrl = selectedResult
// // // //     ? getImageUrl(selectedResult)
// // // //     : null;

// // // //   return (
// // // //     <div className="search-page">
// // // //       <Header />

// // // //       <main className="search-main">
// // // //         <section className="search-hero">
// // // //           <div className="search-eyebrow">✦ Jewellery search</div>

// // // //           <h1>
// // // //             Find your <span>jewellery match.</span>
// // // //           </h1>
// // // //         </section>

// // // //         <section className="search-workspace">
// // // //           <div className="search-step">
// // // //             <div className="search-step-heading">
// // // //               <span>01</span>
// // // //               <div>
// // // //                 <h2>Choose search mode</h2>
// // // //               </div>
// // // //             </div>

// // // //             <SearchModeSelector
// // // //               value={searchMode}
// // // //               onChange={handleSearchModeChange}
// // // //             />
// // // //           </div>

// // // //           <div className="search-step">
// // // //             <div className="search-step-heading">
// // // //               <span>02</span>
// // // //               <div>
// // // //                 <h2>Add jewellery image</h2>
// // // //               </div>
// // // //             </div>

// // // //             <ImageUpload
// // // //               image={selectedImage}
// // // //               onImageChange={handleImageChange}
// // // //             />
// // // //           </div>

// // // //           <button
// // // //             type="button"
// // // //             className="find-match-button"
// // // //             onClick={handleSearch}
// // // //             disabled={loading}
// // // //           >
// // // //             <span>
// // // //               {loading ? "Finding Matches..." : "Find Similar Jewellery"}
// // // //             </span>
// // // //             <strong>{loading ? "…" : "→"}</strong>
// // // //           </button>

// // // //           {message && (
// // // //             <div
// // // //               className={`search-message ${
// // // //                 loading
// // // //                   ? "search-message-loading"
// // // //                   : hasSearched && results.length > 0
// // // //                     ? "search-message-success"
// // // //                     : hasSearched
// // // //                       ? "search-message-error"
// // // //                       : ""
// // // //               }`}
// // // //               role="status"
// // // //               aria-live="polite"
// // // //             >
// // // //               {loading && <span className="search-loading-spinner" />}
// // // //               {message}
// // // //             </div>
// // // //           )}
// // // //         </section>

// // // //         {results.length > 0 && (
// // // //           <section className="search-results-section">
// // // //             <div className="search-results-heading">
// // // //               <span>✦ AI-powered results</span>
// // // //               <h2>Similar Jewellery Designs</h2>
// // // //               <p>Designs identified by the jewellery matching model.</p>
// // // //             </div>

// // // //             <div className="search-results-grid">
// // // //               {results.map((item, index) => {
// // // //                 const imageUrl = getImageUrl(item);
// // // //                 const similarity = getSimilarity(item);
// // // //                 const itemId = getItemId(item);
// // // //                 const name = getItemName(item, index);

// // // //                 return (
// // // //                   <article
// // // //                     className="search-result-card"
// // // //                     key={`${itemId || "design"}-${index}`}
// // // //                   >
// // // //                     <button
// // // //                       type="button"
// // // //                       className="search-result-image"
// // // //                       onClick={() => openResultDetails(item)}
// // // //                       aria-label={`View ${name} details`}
// // // //                     >
// // // //                       {imageUrl && (
// // // //                         <img
// // // //                           src={imageUrl}
// // // //                           alt={name}
// // // //                           loading="lazy"
// // // //                           onError={(event) => {
// // // //                             event.currentTarget.style.display = "none";
// // // //                             event.currentTarget.nextElementSibling?.classList.remove(
// // // //                               "search-image-fallback-hidden",
// // // //                             );
// // // //                           }}
// // // //                         />
// // // //                       )}

// // // //                       <div
// // // //                         className={`search-image-fallback ${
// // // //                           imageUrl ? "search-image-fallback-hidden" : ""
// // // //                         }`}
// // // //                       >
// // // //                         <span>✦</span>
// // // //                         <p>No image</p>
// // // //                       </div>

// // // //                       {similarity !== null && (
// // // //                         <div className="search-similarity-badge">
// // // //                           {similarity.toFixed(1)}% match
// // // //                         </div>
// // // //                       )}
// // // //                     </button>

// // // //                     <div className="search-result-details">
// // // //                       <h3 title={name}>{name}</h3>

// // // //                       {itemId && (
// // // //                         <p className="search-result-id">ID: {String(itemId)}</p>
// // // //                       )}
// // // //                     </div>
// // // //                   </article>
// // // //                 );
// // // //               })}
// // // //             </div>
// // // //           </section>
// // // //         )}

// // // //         {hasSearched && results.length === 0 && !loading && (
// // // //           <section className="search-empty-state">
// // // //             <span>✦</span>
// // // //             <h2>No matches found</h2>
// // // //             <p>
// // // //               Try a clearer jewellery image or choose a different search mode.
// // // //             </p>
// // // //           </section>
// // // //         )}

// // // //         <section className="search-how">
// // // //           <div className="search-how-heading">
// // // //             <span>Search workflow</span>
// // // //             <h2>Simple &amp; straightforward</h2>
// // // //           </div>

// // // //           <div className="search-how-grid">
// // // //             <div className="how-card">
// // // //               <strong>01</strong>
// // // //               <h3>Select</h3>
// // // //               <p>
// // // //                 Choose whether to search across all jewellery or between
// // // //                 specific collections.
// // // //               </p>
// // // //             </div>

// // // //             <div className="how-card">
// // // //               <strong>02</strong>
// // // //               <h3>Upload</h3>
// // // //               <p>
// // // //                 Add a clear image of the jewellery design from your device or
// // // //                 camera.
// // // //               </p>
// // // //             </div>

// // // //             <div className="how-card">
// // // //               <strong>03</strong>
// // // //               <h3>Search</h3>
// // // //               <p>
// // // //                 Let the AI model analyse your image and find similar designs.
// // // //               </p>
// // // //             </div>
// // // //           </div>
// // // //         </section>

// // // //         <div className="search-back">
// // // //           <Link to="/catalogue">← Back to Catalogue</Link>
// // // //         </div>
// // // //       </main>

// // // //       <footer className="search-footer">
// // // //         <div>
// // // //           <strong>JewelMatch AI</strong>
// // // //           <span>Jewellery Catalogue</span>
// // // //         </div>

// // // //         <div>© 2026 JewelMatch AI</div>
// // // //       </footer>

// // // //       {selectedResult && (
// // // //         <div
// // // //           className="catalogue-details-overlay"
// // // //           onMouseDown={(event) => {
// // // //             if (event.target === event.currentTarget) {
// // // //               closeResultDetails();
// // // //             }
// // // //           }}
// // // //         >
// // // //           <div
// // // //             className="catalogue-details-modal"
// // // //             role="dialog"
// // // //             aria-modal="true"
// // // //             aria-label="Jewellery details"
// // // //           >
// // // //             <button
// // // //               type="button"
// // // //               className="catalogue-details-close"
// // // //               onClick={closeResultDetails}
// // // //               aria-label="Close jewellery details"
// // // //             >
// // // //               ×
// // // //             </button>

// // // //             <div className="catalogue-details-image">
// // // //               {selectedResultImageUrl ? (
// // // //                 <img
// // // //                   src={selectedResultImageUrl}
// // // //                   alt={getItemName(selectedResult, 0)}
// // // //                 />
// // // //               ) : (
// // // //                 <div className="catalogue-details-no-image">
// // // //                   No image available
// // // //                 </div>
// // // //               )}
// // // //             </div>

// // // //             <div className="catalogue-details-content">
// // // //               <span className="catalogue-details-collection">
// // // //                 {getCollection(selectedResult) || "Jewellery"}
// // // //               </span>

// // // //               <h2>{getItemName(selectedResult, 0)}</h2>

// // // //               <div className="catalogue-details-id">
// // // //                 <span>Design ID</span>
// // // //                 <strong>{getItemId(selectedResult) || "—"}</strong>
// // // //               </div>

// // // //               <div className="catalogue-details-info-grid">
// // // //                 <div className="catalogue-details-info">
// // // //                   <span>Type</span>
// // // //                   <strong>
// // // //                     {selectedResult.type ||
// // // //                       selectedResult.jewellery_type ||
// // // //                       "—"}
// // // //                   </strong>
// // // //                 </div>

// // // //                 <div className="catalogue-details-info">
// // // //                   <span>Similarity</span>
// // // //                   <strong>
// // // //                     {getSimilarity(selectedResult) !== null
// // // //                       ? `${getSimilarity(selectedResult).toFixed(1)}%`
// // // //                       : "—"}
// // // //                   </strong>
// // // //                 </div>
// // // //               </div>

// // // //               {selectedResult.description && (
// // // //                 <div className="catalogue-details-description">
// // // //                   <span>Description</span>
// // // //                   <p>{selectedResult.description}</p>
// // // //                 </div>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // export default SearchPage;
// // // // ############################################
// // // // 2model integration
// // // // ############################################

// // // import { useEffect, useState } from "react";
// // // import { Link } from "react-router-dom";

// // // import Header from "../components/Header";
// // // import SearchModeSelector from "../components/SearchModeSelector";
// // // import ImageUpload from "../components/ImageUpload";
// // // import { matchJewellery, apiUrl } from "../services/api";
// // // import "../styles/search.css";

// // // const MODEL1_URL =
// // //   import.meta.env.VITE_MODEL_API_URL ||
// // //   "https://jewelmatchai-model.onrender.com";

// // // const MODEL2_URL =
// // //   import.meta.env.VITE_MODEL2_API_URL ||
// // //   "https://jewelmatchai-model-1.onrender.com";

// // // function SearchPage() {
// // //   const [searchMode, setSearchMode] = useState("all");
// // //   const [selectedImage, setSelectedImage] = useState(null);
// // //   const [message, setMessage] = useState("");
// // //   const [model1Results, setModel1Results] = useState([]);
// // //   const [model2Results, setModel2Results] = useState([]);
// // //   const [errors, setErrors] = useState([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [hasSearched, setHasSearched] = useState(false);
// // //   const [selectedResult, setSelectedResult] = useState(null);

// // //   const allResults = [...model1Results, ...model2Results];

// // //   function resetResults() {
// // //     setModel1Results([]);
// // //     setModel2Results([]);
// // //     setErrors([]);
// // //     setHasSearched(false);
// // //   }

// // //   function handleImageChange(image) {
// // //     setSelectedImage(image);
// // //     setMessage("");
// // //     resetResults();
// // //     closeResultDetails();
// // //   }

// // //   function handleSearchModeChange(mode) {
// // //     setSearchMode(mode);
// // //     setMessage("");
// // //     resetResults();
// // //     closeResultDetails();
// // //   }

// // //   async function handleSearch() {
// // //     if (!selectedImage) {
// // //       setMessage("Please upload or capture a jewellery image first.");
// // //       return;
// // //     }

// // //     if (loading) return;

// // //     setLoading(true);
// // //     setMessage("Analysing your image with both matching models...");
// // //     resetResults();
// // //     closeResultDetails();

// // //     try {
// // //       const data = await matchJewellery(selectedImage, searchMode, 10);

// // //       const results1 = Array.isArray(data?.model1) ? data.model1 : [];
// // //       const results2 = Array.isArray(data?.model2) ? data.model2 : [];

// // //       // Compatibility with an older API response, if necessary.
// // //       const legacyResults =
// // //         results1.length === 0 &&
// // //         results2.length === 0 &&
// // //         Array.isArray(data?.results)
// // //           ? data.results
// // //           : [];

// // //       const finalModel1 =
// // //         legacyResults.length > 0
// // //           ? legacyResults.filter((item) => item.model !== "Model 2")
// // //           : results1;

// // //       const finalModel2 =
// // //         legacyResults.length > 0
// // //           ? legacyResults.filter((item) => item.model === "Model 2")
// // //           : results2;

// // //       setModel1Results(finalModel1);
// // //       setModel2Results(finalModel2);
// // //       setErrors(Array.isArray(data?.errors) ? data.errors : []);
// // //       setHasSearched(true);

// // //       const total = finalModel1.length + finalModel2.length;

// // //       if (total === 0) {
// // //         setMessage(
// // //           "No matching designs were returned. Check the model connection or try another image.",
// // //         );
// // //       } else {
// // //         setMessage(
// // //           `Search complete. Model 1 returned ${finalModel1.length} match(es), and Model 2 returned ${finalModel2.length} match(es).`,
// // //         );
// // //       }
// // //     } catch (error) {
// // //       console.error("Jewellery matching error:", error);
// // //       setMessage(
// // //         error.message ||
// // //           "Unable to complete the jewellery search. Please try again.",
// // //       );
// // //       setHasSearched(true);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }

// // //   function getSimilarity(item) {
// // //     const rawScore =
// // //       item.similarity_percent ??
// // //       item.similarity ??
// // //       item.score ??
// // //       item.match_score ??
// // //       item.similarity_score;

// // //     if (rawScore === undefined || rawScore === null) return null;

// // //     const numericScore = Number(rawScore);
// // //     if (!Number.isFinite(numericScore)) return null;

// // //     // Similarity percentages are already normalized by api.js.
// // //     const percentage =
// // //       item.similarity_percent != null
// // //         ? numericScore
// // //         : numericScore >= 0 && numericScore <= 1
// // //           ? numericScore * 100
// // //           : numericScore;

// // //     return Math.max(0, Math.min(100, percentage));
// // //   }

// // //   function getModelBaseUrl(item) {
// // //     return item.model === "Model 2" ? MODEL2_URL : MODEL1_URL;
// // //   }

// // //   function getImageUrl(item) {
// // //     const modelBase = getModelBaseUrl(item);

// // //     const gridFsId =
// // //       item.image_gridfs_id || item.gridfs_id || item.image_file_id;

// // //     if (gridFsId) {
// // //       return `${modelBase}/catalogue-image/stored/${encodeURIComponent(
// // //         gridFsId,
// // //       )}`;
// // //     }

// // //     const imageValue =
// // //       item.image_url ||
// // //       item.image ||
// // //       item.image_path ||
// // //       item.filename ||
// // //       item.image_filename;

// // //     if (!imageValue || typeof imageValue !== "string") return null;

// // //     if (/^https?:\/\//i.test(imageValue)) return imageValue;

// // //     const normalizedPath = imageValue.replace(/\\/g, "/");

// // //     if (normalizedPath.startsWith("/catalogue-image/")) {
// // //       return `${modelBase}${normalizedPath}`;
// // //     }

// // //     if (normalizedPath.includes("/catalogue/")) {
// // //       const cataloguePath = normalizedPath.split("/catalogue/").pop();

// // //       return `${modelBase}/catalogue/${cataloguePath
// // //         .split("/")
// // //         .map(encodeURIComponent)
// // //         .join("/")}`;
// // //     }

// // //     if (normalizedPath.startsWith("/")) {
// // //       return apiUrl(normalizedPath);
// // //     }

// // //     const collection =
// // //       item.matched_collection ||
// // //       item.target ||
// // //       item.collection ||
// // //       item.source_collection;

// // //     if (
// // //       collection &&
// // //       ["gold", "prototype", "prototypes"].includes(
// // //         String(collection).toLowerCase(),
// // //       )
// // //     ) {
// // //       const domain =
// // //         String(collection).toLowerCase() === "gold" ? "gold" : "prototypes";

// // //       const filename = normalizedPath.split("/").pop();

// // //       return `${modelBase}/catalogue/${domain}/${encodeURIComponent(filename)}`;
// // //     }

// // //     return null;
// // //   }

// // //   function getItemName(item, index) {
// // //     return (
// // //       item.name ||
// // //       item.jewellery_name ||
// // //       item.design_name ||
// // //       item.title ||
// // //       item.id ||
// // //       item.jewellery_id ||
// // //       `Matching Design ${index + 1}`
// // //     );
// // //   }

// // //   function getItemId(item) {
// // //     return (
// // //       item.design_id ||
// // //       item.jewellery_id ||
// // //       item.item_id ||
// // //       item.id ||
// // //       item.code ||
// // //       item._id ||
// // //       ""
// // //     );
// // //   }

// // //   function getCollection(item) {
// // //     const collection =
// // //       item.matched_collection ||
// // //       item.target ||
// // //       item.collection ||
// // //       item.source_collection ||
// // //       "";

// // //     if (!collection) return "";

// // //     const normalized = String(collection).toLowerCase();

// // //     if (normalized === "prototype" || normalized === "prototypes") {
// // //       return "Prototype";
// // //     }

// // //     if (normalized === "gold") return "Gold";

// // //     return String(collection);
// // //   }

// // //   function openResultDetails(item) {
// // //     setSelectedResult(item);
// // //     document.body.classList.add("catalogue-overlay-open");
// // //   }

// // //   function closeResultDetails() {
// // //     setSelectedResult(null);
// // //     document.body.classList.remove("catalogue-overlay-open");
// // //   }

// // //   useEffect(() => {
// // //     function handleEscape(event) {
// // //       if (event.key === "Escape") closeResultDetails();
// // //     }

// // //     document.addEventListener("keydown", handleEscape);

// // //     return () => {
// // //       document.removeEventListener("keydown", handleEscape);
// // //       document.body.classList.remove("catalogue-overlay-open");
// // //     };
// // //   }, []);

// // //   function renderResults(items, modelName) {
// // //     if (items.length === 0) return null;

// // //     return (
// // //       <section className="search-results-section" key={modelName}>
// // //         <div className="search-results-heading">
// // //           <span>✦ AI-powered results</span>
// // //           <h2>{modelName} — Similar Jewellery Designs</h2>
// // //           <p>
// // //             {modelName === "Model 1"
// // //               ? "Results from your existing jewellery matching model."
// // //               : "Results from the Segmented DINOv2 ONNX matching model."}
// // //           </p>
// // //           <p>{items.length} matching design(s)</p>
// // //         </div>

// // //         <div className="search-results-grid">
// // //           {items.map((item, index) => {
// // //             const imageUrl = getImageUrl(item);
// // //             // const similarity = getSimilarity(item);
// // //             const itemId = getItemId(item);
// // //             const name = getItemName(item, index);

// // //             return (
// // //               <article
// // //                 className="search-result-card"
// // //                 key={`${modelName}-${itemId || "design"}-${index}`}
// // //               >
// // //                 <button
// // //                   type="button"
// // //                   className="search-result-image"
// // //                   onClick={() => openResultDetails(item)}
// // //                   aria-label={`View ${name} details`}
// // //                 >
// // //                   {imageUrl && (
// // //                     <img
// // //                       src={imageUrl}
// // //                       alt={name}
// // //                       loading="lazy"
// // //                       onError={(event) => {
// // //                         event.currentTarget.style.display = "none";
// // //                         event.currentTarget.nextElementSibling?.classList.remove(
// // //                           "search-image-fallback-hidden",
// // //                         );
// // //                       }}
// // //                     />
// // //                   )}

// // //                   <div
// // //                     className={`search-image-fallback ${
// // //                       imageUrl ? "search-image-fallback-hidden" : ""
// // //                     }`}
// // //                   >
// // //                     <span>✦</span>
// // //                     <p>No image</p>
// // //                   </div>
// // //                 </button>

// // //                 <div className="search-result-details">
// // //                   <h3 title={name}>{name}</h3>

// // //                   {itemId && (
// // //                     <p className="search-result-id">ID: {String(itemId)}</p>
// // //                   )}

// // //                   <p className="search-result-id">{getCollection(item)}</p>
// // //                 </div>
// // //               </article>
// // //             );
// // //           })}
// // //         </div>
// // //       </section>
// // //     );
// // //   }

// // //   const selectedResultImageUrl = selectedResult
// // //     ? getImageUrl(selectedResult)
// // //     : null;

// // //   return (
// // //     <div className="search-page">
// // //       <Header />

// // //       <main className="search-main">
// // //         <section className="search-hero">
// // //           <div className="search-eyebrow">✦ Jewellery search</div>
// // //           <h1>
// // //             Find your <span>jewellery match.</span>
// // //           </h1>
// // //         </section>

// // //         <section className="search-workspace">
// // //           <div className="search-step">
// // //             <div className="search-step-heading">
// // //               <span>01</span>
// // //               <div>
// // //                 <h2>Choose search mode</h2>
// // //               </div>
// // //             </div>

// // //             <SearchModeSelector
// // //               value={searchMode}
// // //               onChange={handleSearchModeChange}
// // //             />
// // //           </div>

// // //           <div className="search-step">
// // //             <div className="search-step-heading">
// // //               <span>02</span>
// // //               <div>
// // //                 <h2>Add jewellery image</h2>
// // //               </div>
// // //             </div>

// // //             <ImageUpload
// // //               image={selectedImage}
// // //               onImageChange={handleImageChange}
// // //             />
// // //           </div>

// // //           <button
// // //             type="button"
// // //             className="find-match-button"
// // //             onClick={handleSearch}
// // //             disabled={loading}
// // //           >
// // //             <span>
// // //               {loading ? "Finding Matches..." : "Find Similar Jewellery"}
// // //             </span>
// // //             <strong>{loading ? "…" : "→"}</strong>
// // //           </button>

// // //           {message && (
// // //             <div
// // //               className={`search-message ${
// // //                 loading
// // //                   ? "search-message-loading"
// // //                   : hasSearched && allResults.length > 0
// // //                     ? "search-message-success"
// // //                     : hasSearched
// // //                       ? "search-message-error"
// // //                       : ""
// // //               }`}
// // //               role="status"
// // //               aria-live="polite"
// // //             >
// // //               {loading && <span className="search-loading-spinner" />}
// // //               {message}
// // //             </div>
// // //           )}

// // //           {errors.length > 0 && (
// // //             <div className="search-message" role="status">
// // //               {errors.map((error, index) => (
// // //                 <p key={`${error.model}-${error.source}-${index}`}>
// // //                   {error.model} ({error.source}): {error.message}
// // //                 </p>
// // //               ))}
// // //             </div>
// // //           )}
// // //         </section>

// // //         {hasSearched && (
// // //           <>
// // //             {renderResults(model1Results, "Model 1")}
// // //             {renderResults(model2Results, "Model 2")}
// // //           </>
// // //         )}

// // //         {hasSearched && allResults.length === 0 && !loading && (
// // //           <section className="search-empty-state">
// // //             <span>✦</span>
// // //             <h2>No matches found</h2>
// // //             <p>
// // //               Try a clearer jewellery image or choose a different search mode.
// // //             </p>
// // //           </section>
// // //         )}

// // //         <section className="search-how">
// // //           <div className="search-how-heading">
// // //             <span>Search workflow</span>
// // //             <h2>Simple &amp; straightforward</h2>
// // //           </div>

// // //           <div className="search-how-grid">
// // //             <div className="how-card">
// // //               <strong>01</strong>
// // //               <h3>Select</h3>
// // //               <p>
// // //                 Choose whether to search across all jewellery or between
// // //                 specific collections.
// // //               </p>
// // //             </div>

// // //             <div className="how-card">
// // //               <strong>02</strong>
// // //               <h3>Upload</h3>
// // //               <p>
// // //                 Add a clear image of the jewellery design from your device or
// // //                 camera.
// // //               </p>
// // //             </div>

// // //             <div className="how-card">
// // //               <strong>03</strong>
// // //               <h3>Search</h3>
// // //               <p>
// // //                 Both AI models analyse your image and return their matching
// // //                 designs independently.
// // //               </p>
// // //             </div>
// // //           </div>
// // //         </section>

// // //         <div className="search-back">
// // //           <Link to="/catalogue">← Back to Catalogue</Link>
// // //         </div>
// // //       </main>

// // //       <footer className="search-footer">
// // //         <div>
// // //           <strong>JewelMatch AI</strong>
// // //           <span>Jewellery Catalogue</span>
// // //         </div>
// // //         <div>© 2026 JewelMatch AI</div>
// // //       </footer>

// // //       {selectedResult && (
// // //         <div
// // //           className="catalogue-details-overlay"
// // //           onMouseDown={(event) => {
// // //             if (event.target === event.currentTarget) {
// // //               closeResultDetails();
// // //             }
// // //           }}
// // //         >
// // //           <div
// // //             className="catalogue-details-modal"
// // //             role="dialog"
// // //             aria-modal="true"
// // //             aria-label="Jewellery details"
// // //           >
// // //             <button
// // //               type="button"
// // //               className="catalogue-details-close"
// // //               onClick={closeResultDetails}
// // //               aria-label="Close jewellery details"
// // //             >
// // //               ×
// // //             </button>

// // //             <div className="catalogue-details-image">
// // //               {selectedResultImageUrl ? (
// // //                 <img
// // //                   src={selectedResultImageUrl}
// // //                   alt={getItemName(selectedResult, 0)}
// // //                 />
// // //               ) : (
// // //                 <div className="catalogue-details-no-image">
// // //                   No image available
// // //                 </div>
// // //               )}
// // //             </div>

// // //             <div className="catalogue-details-content">
// // //               <span className="catalogue-details-collection">
// // //                 {getCollection(selectedResult) || "Jewellery"}
// // //               </span>

// // //               <h2>{getItemName(selectedResult, 0)}</h2>

// // //               <div className="catalogue-details-id">
// // //                 <span>Design ID</span>
// // //                 <strong>{getItemId(selectedResult) || "—"}</strong>
// // //               </div>

// // //               <div className="catalogue-details-info-grid">
// // //                 <div className="catalogue-details-info">
// // //                   <span>Type</span>
// // //                   <strong>
// // //                     {selectedResult.type ||
// // //                       selectedResult.jewellery_type ||
// // //                       "—"}
// // //                   </strong>
// // //                 </div>
// // //               </div>

// // //               <div className="catalogue-details-info">
// // //                 <span>Matching model</span>
// // //                 <strong>{selectedResult.model || "—"}</strong>
// // //               </div>

// // //               {selectedResult.description && (
// // //                 <div className="catalogue-details-description">
// // //                   <span>Description</span>
// // //                   <p>{selectedResult.description}</p>
// // //                 </div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // export default SearchPage;
// // // #############################
// // // #############################

// // import { useEffect, useState } from "react";
// // import { Link } from "react-router-dom";

// // import Header from "../components/Header";
// // import SearchModeSelector from "../components/SearchModeSelector";
// // import ImageUpload from "../components/ImageUpload";

// // import { matchJewellery, apiUrl } from "../services/api";

// // import "../styles/search.css";

// // function SearchPage() {
// //   const [searchMode, setSearchMode] = useState("all");
// //   const [selectedImage, setSelectedImage] = useState(null);
// //   const [message, setMessage] = useState("");
// //   const [results, setResults] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [hasSearched, setHasSearched] = useState(false);
// //   const [selectedResult, setSelectedResult] = useState(null);

// //   // Start with a 90-second cooldown.
// //   const [cooldownSeconds, setCooldownSeconds] = useState(90);

// //   // Start the countdown when SearchPage mounts.
// //   useEffect(() => {
// //     const deadline = Date.now() + 90 * 1000;

// //     const updateCountdown = () => {
// //       const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

// //       setCooldownSeconds(remaining);
// //     };

// //     updateCountdown();

// //     const timer = setInterval(updateCountdown, 250);

// //     return () => clearInterval(timer);
// //   }, []);

// //   function handleImageChange(image) {
// //     setSelectedImage(image);
// //     setMessage("");
// //     setResults([]);
// //     setHasSearched(false);
// //   }

// //   function handleSearchModeChange(mode) {
// //     setSearchMode(mode);
// //     setMessage("");
// //     setResults([]);
// //     setHasSearched(false);
// //   }

// //   async function handleSearch() {
// //     if (cooldownSeconds > 0) {
// //       return;
// //     }

// //     if (!selectedImage) {
// //       setMessage("Please upload or capture a jewellery image first.");
// //       return;
// //     }

// //     if (loading) return;

// //     setLoading(true);
// //     setMessage("Analysing your jewellery image and finding similar designs...");
// //     setResults([]);
// //     setHasSearched(false);

// //     try {
// //       // Existing matching API call.
// //       const data = await matchJewellery(selectedImage, searchMode, 12);

// //       const matchedResults = Array.isArray(data?.results) ? data.results : [];

// //       setResults(matchedResults);
// //       setHasSearched(true);

// //       if (matchedResults.length === 0) {
// //         setMessage(
// //           "No similar jewellery designs were found. Try another image or search mode.",
// //         );
// //       } else {
// //         setMessage(
// //           `Search complete. Found ${matchedResults.length} matching design(s).`,
// //         );
// //       }
// //     } catch (error) {
// //       console.error("Jewellery matching error:", error);

// //       setMessage(
// //         error.message ||
// //           "Unable to complete the jewellery search. Please try again.",
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   function getSimilarity(item) {
// //     const rawScore =
// //       item.similarity ??
// //       item.score ??
// //       item.match_score ??
// //       item.similarity_score;

// //     if (rawScore === undefined || rawScore === null) {
// //       return null;
// //     }

// //     const numericScore = Number(rawScore);

// //     if (!Number.isFinite(numericScore)) {
// //       return null;
// //     }

// //     const percentage =
// //       numericScore >= 0 && numericScore <= 1
// //         ? numericScore * 100
// //         : numericScore;

// //     return Math.max(0, Math.min(100, percentage));
// //   }

// //   function getImageUrl(item) {
// //     const imageValue =
// //       item.image_url ||
// //       item.image ||
// //       item.image_path ||
// //       item.filename ||
// //       item.image_filename;

// //     if (!imageValue || typeof imageValue !== "string") {
// //       return null;
// //     }

// //     // Preserve complete external URLs.
// //     if (/^https?:\/\//i.test(imageValue)) {
// //       return imageValue;
// //     }

// //     // Support catalogue images stored in GridFS.
// //     const gridFsId =
// //       item.image_gridfs_id ||
// //       item.gridfs_id ||
// //       item.image_id ||
// //       item.image_file_id;

// //     if (gridFsId) {
// //       return `https://jewelmatchai-model.onrender.com/catalogue-image/stored/${encodeURIComponent(
// //         gridFsId,
// //       )}`;
// //     }

// //     // Convert Windows paths to URL-style paths.
// //     const normalisedPath = imageValue.replace(/\\/g, "/");

// //     // Handle paths containing /catalogue/.
// //     if (normalisedPath.includes("/catalogue/")) {
// //       const cataloguePath = normalisedPath.split("/catalogue/").pop();

// //       if (cataloguePath) {
// //         return `https://jewelmatchai-model.onrender.com/catalogue/${cataloguePath
// //           .split("/")
// //           .map(encodeURIComponent)
// //           .join("/")}`;
// //       }
// //     }

// //     // Handle relative image URLs.
// //     if (normalisedPath.startsWith("/")) {
// //       return apiUrl(normalisedPath);
// //     }

// //     // Handle a relative filename with a known collection.
// //     const collection =
// //       item.collection || item.matched_collection || item.source_collection;

// //     if (
// //       collection &&
// //       ["gold", "prototype", "prototypes"].includes(
// //         String(collection).toLowerCase(),
// //       )
// //     ) {
// //       const domain =
// //         String(collection).toLowerCase() === "gold" ? "gold" : "prototypes";

// //       const filename = normalisedPath.split("/").pop();

// //       return `https://jewelmatchai-model.onrender.com/catalogue/${domain}/${encodeURIComponent(
// //         filename,
// //       )}`;
// //     }

// //     return null;
// //   }

// //   function getItemName(item, index) {
// //     return (
// //       item.name ||
// //       item.jewellery_name ||
// //       item.design_name ||
// //       item.title ||
// //       item.id ||
// //       item.jewellery_id ||
// //       `Matching Design ${index + 1}`
// //     );
// //   }

// //   function getItemId(item) {
// //     return (
// //       item.jewellery_id ||
// //       item.item_id ||
// //       item.id ||
// //       item.code ||
// //       item._id ||
// //       ""
// //     );
// //   }

// //   function getCollection(item) {
// //     const collection =
// //       item.matched_collection ||
// //       item.collection ||
// //       item.source_collection ||
// //       "";

// //     if (!collection) return "";

// //     const normalised = String(collection).toLowerCase();

// //     if (normalised === "prototype" || normalised === "prototypes") {
// //       return "Prototype";
// //     }

// //     if (normalised === "gold") {
// //       return "Gold";
// //     }

// //     return String(collection);
// //   }

// //   return (
// //     <div className="search-page">
// //       <Header />

// //       <main className="search-main">
// //         <section className="search-hero">
// //           <div className="search-eyebrow">✦ Jewellery search</div>

// //           <h1>
// //             Find your <span>jewellery match.</span>
// //           </h1>
// //         </section>

// //         <section className="search-workspace">
// //           <div className="search-step">
// //             <div className="search-step-heading">
// //               <span>01</span>
// //               <div>
// //                 <h2>Choose search mode</h2>
// //               </div>
// //             </div>

// //             <SearchModeSelector
// //               value={searchMode}
// //               onChange={handleSearchModeChange}
// //             />
// //           </div>

// //           <div className="search-step">
// //             <div className="search-step-heading">
// //               <span>02</span>
// //               <div>
// //                 <h2>Add jewellery image</h2>
// //               </div>
// //             </div>

// //             <ImageUpload
// //               image={selectedImage}
// //               onImageChange={handleImageChange}
// //             />
// //           </div>

// //           {/* Find Similar button with 90-second countdown */}
// //           <button
// //             type="button"
// //             className="find-match-button"
// //             onClick={handleSearch}
// //             disabled={loading || cooldownSeconds > 0}
// //           >
// //             <span>
// //               {loading
// //                 ? "Finding Matches..."
// //                 : cooldownSeconds > 0
// //                   ? `Find Similar Jewellery (${Math.floor(
// //                       cooldownSeconds / 60,
// //                     )}:${String(cooldownSeconds % 60).padStart(2, "0")})`
// //                   : "Find Similar Jewellery"}
// //             </span>

// //             <strong>{loading ? "…" : cooldownSeconds > 0 ? "⌛" : "→"}</strong>
// //           </button>

// //           {message && (
// //             <div
// //               className={`search-message ${
// //                 loading
// //                   ? "search-message-loading"
// //                   : hasSearched && results.length > 0
// //                     ? "search-message-success"
// //                     : hasSearched
// //                       ? "search-message-error"
// //                       : ""
// //               }`}
// //               role="status"
// //               aria-live="polite"
// //             >
// //               {loading && <span className="search-loading-spinner" />}
// //               {message}
// //             </div>
// //           )}
// //         </section>

// //         {results.length > 0 && (
// //           <section className="search-results-section">
// //             <div className="search-results-heading">
// //               <span>✦ AI-powered results</span>
// //               <h2>Similar Jewellery Designs</h2>
// //               <p>Designs identified by the jewellery matching model.</p>
// //             </div>

// //             <div className="search-results-grid">
// //               {results.map((item, index) => {
// //                 const imageUrl = getImageUrl(item);
// //                 const similarity = getSimilarity(item);
// //                 const itemId = getItemId(item);
// //                 const collection = getCollection(item);

// //                 return (
// //                   <article
// //                     className="search-result-card"
// //                     key={`${itemId || "design"}-${index}`}
// //                   >
// //                     <div className="search-result-image">
// //                       {imageUrl ? (
// //                         <img
// //                           src={imageUrl}
// //                           alt={getItemName(item, index)}
// //                           loading="lazy"
// //                           onError={(event) => {
// //                             event.currentTarget.style.display = "none";

// //                             event.currentTarget.nextElementSibling?.classList.remove(
// //                               "search-image-fallback-hidden",
// //                             );
// //                           }}
// //                         />
// //                       ) : null}

// //                       <div
// //                         className={`search-image-fallback ${
// //                           imageUrl ? "search-image-fallback-hidden" : ""
// //                         }`}
// //                       >
// //                         <span>✦</span>
// //                         <p>Jewellery image unavailable</p>
// //                       </div>

// //                       {similarity !== null && (
// //                         <div className="search-similarity-badge">
// //                           {similarity.toFixed(1)}% match
// //                         </div>
// //                       )}
// //                     </div>

// //                     <div className="search-result-details">
// //                       <h3>{getItemName(item, index)}</h3>

// //                       {itemId && (
// //                         <p className="search-result-id">ID: {String(itemId)}</p>
// //                       )}

// //                       {collection && (
// //                         <span className="search-result-collection">
// //                           {collection}
// //                         </span>
// //                       )}

// //                       {(item.type || item.jewellery_type) && (
// //                         <p className="search-result-type">
// //                           Type: {item.type || item.jewellery_type}
// //                         </p>
// //                       )}

// //                       {similarity !== null && (
// //                         <div className="search-similarity">
// //                           <div className="search-similarity-label">
// //                             <span>Similarity score</span>
// //                             <strong>{similarity.toFixed(1)}%</strong>
// //                           </div>

// //                           <div className="search-similarity-track">
// //                             <div
// //                               className="search-similarity-fill"
// //                               style={{ width: `${similarity}%` }}
// //                             />
// //                           </div>
// //                         </div>
// //                       )}
// //                     </div>
// //                   </article>
// //                 );
// //               })}
// //             </div>
// //           </section>
// //         )}

// //         {hasSearched && results.length === 0 && !loading && (
// //           <section className="search-empty-state">
// //             <span>✦</span>
// //             <h2>No matches found</h2>
// //             <p>
// //               Try a clearer jewellery image or choose a different search mode.
// //             </p>
// //           </section>
// //         )}

// //         <section className="search-how">
// //           <div className="search-how-heading">
// //             <span>Search workflow</span>
// //             <h2>Simple &amp; straightforward</h2>
// //           </div>

// //           <div className="search-how-grid">
// //             <div className="how-card">
// //               <strong>01</strong>
// //               <h3>Select</h3>
// //               <p>
// //                 Choose whether to search across all jewellery or between
// //                 specific collections.
// //               </p>
// //             </div>

// //             <div className="how-card">
// //               <strong>02</strong>
// //               <h3>Upload</h3>
// //               <p>
// //                 Add a clear image of the jewellery design from your device or
// //                 camera.
// //               </p>
// //             </div>

// //             <div className="how-card">
// //               <strong>03</strong>
// //               <h3>Search</h3>
// //               <p>
// //                 Let the AI model analyse your image and find similar designs.
// //               </p>
// //             </div>
// //           </div>
// //         </section>

// //         <div className="search-back">
// //           <Link to="/catalogue">← Back to Catalogue</Link>
// //         </div>
// //       </main>

// //       <footer className="search-footer">
// //         <div>
// //           <strong>JewelMatch AI</strong>
// //           <span>Jewellery Catalogue</span>
// //         </div>

// //         <div>© 2026 JewelMatch AI</div>
// //       </footer>
// //     </div>
// //   );
// // }

// // export default SearchPage;
// //
// // ############################
// // #################################
// // ##################################

// import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";

// import Header from "../components/Header";
// import SearchModeSelector from "../components/SearchModeSelector";
// import ImageUpload from "../components/ImageUpload";

// import { matchJewellery, apiUrl } from "../services/api";

// import "../styles/search.css";

// function SearchPage() {
//   const [searchMode, setSearchMode] = useState("all");
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [message, setMessage] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [selectedResult, setSelectedResult] = useState(null);

//   // Initial countdown: 90 seconds.
//   const [cooldownSeconds, setCooldownSeconds] = useState(90);
//   const cooldownTimerRef = useRef(null);

//   function startCooldown(duration) {
//     if (cooldownTimerRef.current) {
//       clearInterval(cooldownTimerRef.current);
//       cooldownTimerRef.current = null;
//     }

//     const deadline = Date.now() + duration * 1000;

//     const updateCountdown = () => {
//       const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

//       setCooldownSeconds(remaining);

//       if (remaining <= 0 && cooldownTimerRef.current) {
//         clearInterval(cooldownTimerRef.current);
//         cooldownTimerRef.current = null;
//       }
//     };

//     setCooldownSeconds(duration);
//     updateCountdown();

//     cooldownTimerRef.current = setInterval(updateCountdown, 250);
//   }

//   function closeResultDetails() {
//     setSelectedResult(null);
//   }

//   // Start countdown and clean up the timer when the page unmounts.
//   useEffect(() => {
//     startCooldown(90);

//     return () => {
//       if (cooldownTimerRef.current) {
//         clearInterval(cooldownTimerRef.current);
//         cooldownTimerRef.current = null;
//       }
//       document.body.classList.remove("catalogue-overlay-open");
//     };
//   }, []);

//   // Close the popup with Escape and prevent background scrolling.
//   useEffect(() => {
//     if (!selectedResult) {
//       document.body.classList.remove("catalogue-overlay-open");
//       return undefined;
//     }

//     document.body.classList.add("catalogue-overlay-open");

//     function handleEscape(event) {
//       if (event.key === "Escape") {
//         closeResultDetails();
//       }
//     }

//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//       document.body.classList.remove("catalogue-overlay-open");
//     };
//   }, [selectedResult]);

//   function handleImageChange(image) {
//     setSelectedImage(image);
//     setMessage("");
//     setResults([]);
//     setHasSearched(false);
//     closeResultDetails();
//   }

//   function handleSearchModeChange(mode) {
//     setSearchMode(mode);
//     setMessage("");
//     setResults([]);
//     setHasSearched(false);
//     closeResultDetails();
//   }

//   async function handleSearch() {
//     if (cooldownSeconds > 0) return;

//     if (!selectedImage) {
//       setMessage("Please upload or capture a jewellery image first.");
//       return;
//     }

//     if (loading) return;

//     setLoading(true);
//     setMessage("Analysing your jewellery image and finding similar designs...");
//     setResults([]);
//     setHasSearched(false);
//     closeResultDetails();

//     try {
//       // Preserve the existing matching API and search modes.
//       const data = await matchJewellery(selectedImage, searchMode, 12);

//       const matchedResults = Array.isArray(data?.results) ? data.results : [];

//       setResults(matchedResults);
//       setHasSearched(true);

//       if (matchedResults.length === 0) {
//         setMessage(
//           "No similar jewellery designs were found. Try another image or search mode.",
//         );
//       } else {
//         setMessage(
//           `Search complete. Found ${matchedResults.length} matching design(s).`,
//         );
//       }

//       // Start a fresh 60-second countdown after a successful API response.
//       startCooldown(60);
//     } catch (error) {
//       console.error("Jewellery matching error:", error);

//       setMessage(
//         error.message ||
//           "Unable to complete the jewellery search. Please try again.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function getImageUrl(item) {
//     const imageValue =
//       item.image_url ||
//       item.image ||
//       item.image_path ||
//       item.filename ||
//       item.image_filename;

//     if (!imageValue || typeof imageValue !== "string") {
//       return null;
//     }

//     // Keep complete external URLs unchanged.
//     if (/^https?:\/\//i.test(imageValue)) {
//       return imageValue;
//     }

//     // Support catalogue images stored in GridFS.
//     const gridFsId =
//       item.image_gridfs_id ||
//       item.gridfs_id ||
//       item.image_id ||
//       item.image_file_id;

//     if (gridFsId) {
//       return `https://jewelmatchai-model.onrender.com/catalogue-image/stored/${encodeURIComponent(
//         gridFsId,
//       )}`;
//     }

//     const normalisedPath = imageValue.replace(/\\/g, "/");

//     // Handle paths containing /catalogue/.
//     if (normalisedPath.includes("/catalogue/")) {
//       const cataloguePath = normalisedPath.split("/catalogue/").pop();

//       if (cataloguePath) {
//         return `https://jewelmatchai-model.onrender.com/catalogue/${cataloguePath
//           .split("/")
//           .map(encodeURIComponent)
//           .join("/")}`;
//       }
//     }

//     // Handle relative image URLs.
//     if (normalisedPath.startsWith("/")) {
//       return apiUrl(normalisedPath);
//     }

//     // Handle relative filenames with a known collection.
//     const collection =
//       item.collection || item.matched_collection || item.source_collection;

//     if (
//       collection &&
//       ["gold", "prototype", "prototypes"].includes(
//         String(collection).toLowerCase(),
//       )
//     ) {
//       const domain =
//         String(collection).toLowerCase() === "gold" ? "gold" : "prototypes";

//       const filename = normalisedPath.split("/").pop();

//       return `https://jewelmatchai-model.onrender.com/catalogue/${domain}/${encodeURIComponent(
//         filename,
//       )}`;
//     }

//     return null;
//   }

//   function getItemName(item, index) {
//     return (
//       item.name ||
//       item.jewellery_name ||
//       item.design_name ||
//       item.title ||
//       item.id ||
//       item.jewellery_id ||
//       `Matching Design ${index + 1}`
//     );
//   }

//   function getItemId(item) {
//     return (
//       item.jewellery_id ||
//       item.item_id ||
//       item.id ||
//       item.code ||
//       item._id ||
//       ""
//     );
//   }

//   function getCollection(item) {
//     const collection =
//       item.matched_collection ||
//       item.collection ||
//       item.source_collection ||
//       "";

//     if (!collection) return "";

//     const normalised = String(collection).toLowerCase();

//     if (normalised === "prototype" || normalised === "prototypes") {
//       return "Prototype";
//     }

//     if (normalised === "gold") {
//       return "Gold";
//     }

//     return String(collection);
//   }

//   function openResultDetails(item, index) {
//     setSelectedResult({
//       item,
//       imageUrl: getImageUrl(item),
//       name: getItemName(item, index),
//       id: getItemId(item),
//       collection: getCollection(item),
//     });
//   }

//   const formattedCooldown = `${Math.floor(
//     cooldownSeconds / 60,
//   )}:${String(cooldownSeconds % 60).padStart(2, "0")}`;

//   return (
//     <div className="search-page">
//       <Header />

//       <main className="search-main">
//         <section className="search-hero">
//           <div className="search-eyebrow">✦ Jewellery search</div>

//           <h1>
//             Find your <span>jewellery match.</span>
//           </h1>
//         </section>

//         <section className="search-workspace">
//           <div className="search-step">
//             <div className="search-step-heading">
//               <span>01</span>
//               <div>
//                 <h2>Choose search mode</h2>
//               </div>
//             </div>

//             <SearchModeSelector
//               value={searchMode}
//               onChange={handleSearchModeChange}
//             />
//           </div>

//           <div className="search-step">
//             <div className="search-step-heading">
//               <span>02</span>
//               <div>
//                 <h2>Add jewellery image</h2>
//               </div>
//             </div>

//             <ImageUpload
//               image={selectedImage}
//               onImageChange={handleImageChange}
//             />
//           </div>

//           <button
//             type="button"
//             className="find-match-button"
//             onClick={handleSearch}
//             disabled={loading || cooldownSeconds > 0}
//           >
//             <span>
//               {loading
//                 ? "Finding Matches..."
//                 : cooldownSeconds > 0
//                   ? `Find Similar Jewellery (${formattedCooldown})`
//                   : "Find Similar Jewellery"}
//             </span>

//             <strong>{loading ? "…" : cooldownSeconds > 0 ? "⌛" : "→"}</strong>
//           </button>

//           {message && (
//             <div
//               className={`search-message ${
//                 loading
//                   ? "search-message-loading"
//                   : hasSearched && results.length > 0
//                     ? "search-message-success"
//                     : hasSearched
//                       ? "search-message-error"
//                       : ""
//               }`}
//               role="status"
//               aria-live="polite"
//             >
//               {loading && <span className="search-loading-spinner" />}
//               {message}
//             </div>
//           )}
//         </section>

//         {results.length > 0 && (
//           <section className="search-results-section">
//             <div className="search-results-heading">
//               <span>✦ AI-powered results</span>
//               <h2>Similar Jewellery Designs</h2>
//               <p>Designs identified by the jewellery matching model.</p>
//             </div>

//             <div className="search-results-grid">
//               {results.map((item, index) => {
//                 const imageUrl = getImageUrl(item);
//                 const itemId = getItemId(item);
//                 const name = getItemName(item, index);
//                 const collection = getCollection(item);

//                 return (
//                   <article
//                     className="search-result-card"
//                     key={`${itemId || "design"}-${index}`}
//                   >
//                     <button
//                       type="button"
//                       className="search-result-image"
//                       onClick={() => openResultDetails(item, index)}
//                       aria-label={`View details for ${name}`}
//                     >
//                       {imageUrl && (
//                         <img
//                           src={imageUrl}
//                           alt={name}
//                           loading="lazy"
//                           onError={(event) => {
//                             event.currentTarget.style.display = "none";
//                             event.currentTarget.nextElementSibling?.classList.remove(
//                               "search-image-fallback-hidden",
//                             );
//                           }}
//                         />
//                       )}

//                       <div
//                         className={`search-image-fallback ${
//                           imageUrl ? "search-image-fallback-hidden" : ""
//                         }`}
//                       >
//                         <span>✦</span>
//                         <p>Jewellery image unavailable</p>
//                       </div>
//                     </button>

//                     <div className="search-result-details">
//                       <h3 title={name}>{name}</h3>

//                       {itemId && (
//                         <p className="search-result-id">ID: {String(itemId)}</p>
//                       )}

//                       {collection && (
//                         <span className="search-result-collection">
//                           {collection}
//                         </span>
//                       )}

//                       {(item.type || item.jewellery_type) && (
//                         <p className="search-result-type">
//                           Type: {item.type || item.jewellery_type}
//                         </p>
//                       )}
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           </section>
//         )}

//         {hasSearched && results.length === 0 && !loading && (
//           <section className="search-empty-state">
//             <span>✦</span>
//             <h2>No matches found</h2>
//             <p>
//               Try a clearer jewellery image or choose a different search mode.
//             </p>
//           </section>
//         )}

//         <section className="search-how">
//           <div className="search-how-heading">
//             <span>Search workflow</span>
//             <h2>Simple &amp; straightforward</h2>
//           </div>

//           <div className="search-how-grid">
//             <div className="how-card">
//               <strong>01</strong>
//               <h3>Select</h3>
//               <p>
//                 Choose whether to search across all jewellery or between
//                 specific collections.
//               </p>
//             </div>

//             <div className="how-card">
//               <strong>02</strong>
//               <h3>Upload</h3>
//               <p>
//                 Add a clear image of the jewellery design from your device or
//                 camera.
//               </p>
//             </div>

//             <div className="how-card">
//               <strong>03</strong>
//               <h3>Search</h3>
//               <p>
//                 Let the AI model analyse your image and find similar designs.
//               </p>
//             </div>
//           </div>
//         </section>

//         <div className="search-back">
//           <Link to="/catalogue">← Back to Catalogue</Link>
//         </div>
//       </main>

//       <footer className="search-footer">
//         <div>
//           <strong>JewelMatch AI</strong>
//           <span>Jewellery Catalogue</span>
//         </div>

//         <div>© 2026 JewelMatch AI</div>
//       </footer>

//       {/* Jewellery result overlay popup */}
//       {selectedResult && (
//         <div
//           className="catalogue-details-overlay"
//           onMouseDown={(event) => {
//             if (event.target === event.currentTarget) {
//               closeResultDetails();
//             }
//           }}
//         >
//           <div
//             className="catalogue-details-modal"
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="search-result-modal-title"
//           >
//             <button
//               type="button"
//               className="catalogue-details-close"
//               onClick={closeResultDetails}
//               aria-label="Close jewellery details"
//             >
//               ×
//             </button>

//             <div className="catalogue-details-image">
//               {selectedResult.imageUrl ? (
//                 <img src={selectedResult.imageUrl} alt={selectedResult.name} />
//               ) : (
//                 <div className="catalogue-details-no-image">
//                   Jewellery image unavailable
//                 </div>
//               )}
//             </div>

//             <div className="catalogue-details-content">
//               <span className="catalogue-details-collection">
//                 {selectedResult.collection || "Jewellery"}
//               </span>

//               <h2 id="search-result-modal-title">{selectedResult.name}</h2>

//               <div className="catalogue-details-id">
//                 <span>Design ID</span>
//                 <strong>
//                   {selectedResult.id ? String(selectedResult.id) : "—"}
//                 </strong>
//               </div>

//               <div className="catalogue-details-info-grid">
//                 <div className="catalogue-details-info">
//                   <span>Type</span>
//                   <strong>
//                     {selectedResult.item.type ||
//                       selectedResult.item.jewellery_type ||
//                       "—"}
//                   </strong>
//                 </div>

//                 <div className="catalogue-details-info">
//                   <span>Collection</span>
//                   <strong>{selectedResult.collection || "—"}</strong>
//                 </div>
//               </div>

//               {selectedResult.item.description && (
//                 <div className="catalogue-details-description">
//                   <span>Description</span>
//                   <p>{selectedResult.item.description}</p>
//                 </div>
//               )}

//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default SearchPage;
//
// #########################################################################
//

// import { useEffect, useRef, useState } from "react";
// import { Link } from "react-router-dom";

// import Header from "../components/Header";
// import SearchModeSelector from "../components/SearchModeSelector";
// import ImageUpload from "../components/ImageUpload";

// import { matchJewellery, apiUrl } from "../services/api";

// import "../styles/search.css";

// const BACKEND_URL = (
//   import.meta.env.VITE_API_BASE_URL || "http://46.202.167.86:8088"
// ).replace(/\/+$/, "");

// function SearchPage() {
//   const [searchMode, setSearchMode] = useState("all");
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [message, setMessage] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [hasSearched, setHasSearched] = useState(false);
//   const [selectedResult, setSelectedResult] = useState(null);

//   // Initial cooldown: 90 seconds.
//   const [cooldownSeconds, setCooldownSeconds] = useState(90);
//   const cooldownTimerRef = useRef(null);

//   function startCooldown(duration) {
//     if (cooldownTimerRef.current) {
//       clearInterval(cooldownTimerRef.current);
//       cooldownTimerRef.current = null;
//     }

//     const deadline = Date.now() + duration * 1000;

//     const updateCountdown = () => {
//       const remaining = Math.max(
//         0,
//         Math.ceil((deadline - Date.now()) / 1000),
//       );

//       setCooldownSeconds(remaining);

//       if (remaining <= 0 && cooldownTimerRef.current) {
//         clearInterval(cooldownTimerRef.current);
//         cooldownTimerRef.current = null;
//       }
//     };

//     setCooldownSeconds(duration);
//     updateCountdown();

//     cooldownTimerRef.current = setInterval(updateCountdown, 250);
//   }

//   function closeResultDetails() {
//     setSelectedResult(null);
//   }

//   // Start the initial cooldown and clean up on unmount.
//   useEffect(() => {
//     startCooldown(90);

//     return () => {
//       if (cooldownTimerRef.current) {
//         clearInterval(cooldownTimerRef.current);
//         cooldownTimerRef.current = null;
//       }

//       document.body.classList.remove("catalogue-overlay-open");
//     };
//   }, []);

//   // Close the popup with Escape and prevent background scrolling.
//   useEffect(() => {
//     if (!selectedResult) {
//       document.body.classList.remove("catalogue-overlay-open");
//       return undefined;
//     }

//     document.body.classList.add("catalogue-overlay-open");

//     function handleEscape(event) {
//       if (event.key === "Escape") {
//         closeResultDetails();
//       }
//     }

//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//       document.body.classList.remove("catalogue-overlay-open");
//     };
//   }, [selectedResult]);

//   function handleImageChange(image) {
//     setSelectedImage(image);
//     setMessage("");
//     setResults([]);
//     setHasSearched(false);
//     closeResultDetails();
//   }

//   function handleSearchModeChange(mode) {
//     setSearchMode(mode);
//     setMessage("");
//     setResults([]);
//     setHasSearched(false);
//     closeResultDetails();
//   }

//   async function handleSearch() {
//     if (cooldownSeconds > 0) {
//       setMessage(
//         `Please wait ${formattedCooldown} before starting the next search.`,
//       );
//       return;
//     }

//     if (!selectedImage) {
//       setMessage("Please upload or capture a jewellery image first.");
//       return;
//     }

//     if (loading) return;

//     setLoading(true);
//     setMessage(
//       "Analysing your jewellery image and finding similar designs...",
//     );
//     setResults([]);
//     setHasSearched(false);
//     closeResultDetails();

//     try {
//       // Use the existing API service and selected search mode.
//       const data = await matchJewellery(selectedImage, searchMode, 12);

//       const matchedResults = Array.isArray(data?.results)
//         ? data.results
//         : [];

//       setResults(matchedResults);
//       setHasSearched(true);

//       if (matchedResults.length === 0) {
//         setMessage(
//           "No similar jewellery designs were found. Try another image or search mode.",
//         );
//       } else {
//         setMessage(
//           `Search complete. Found ${matchedResults.length} matching design(s).`,
//         );
//       }

//       // Start a fresh 60-second cooldown after a successful API response.
//       startCooldown(60);
//     } catch (error) {
//       console.error("Jewellery matching error:", error);

//       setMessage(
//         error?.message ||
//           "Unable to complete the jewellery search. Please try again.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function getImageUrl(item) {
//     if (!item || typeof item !== "object") {
//       return null;
//     }

//     const imageValue =
//       item.image_url ||
//       item.imageUrl ||
//       item.image ||
//       item.image_path ||
//       item.filename ||
//       item.image_filename;

//     const gridFsId =
//       item.image_gridfs_id ||
//       item.gridfs_id ||
//       item.image_file_id ||
//       item.image_id;

//     // Prefer the new backend's GridFS image route when an ID is available.
//     if (gridFsId) {
//       return `${BACKEND_URL}/catalogue-image/stored/${encodeURIComponent(
//         String(gridFsId),
//       )}`;
//     }

//     if (!imageValue || typeof imageValue !== "string") {
//       return null;
//     }

//     // Preserve complete external image URLs.
//     if (/^https?:\/\//i.test(imageValue)) {
//       return imageValue;
//     }

//     const normalisedPath = imageValue.replace(/\\/g, "/");

//     // Handle relative GridFS routes.
//     if (normalisedPath.startsWith("/catalogue-image/")) {
//       return `${BACKEND_URL}${normalisedPath
//         .split("/")
//         .map((part, index) =>
//           index === 0 || part === "catalogue-image" || part === "stored"
//             ? part
//             : encodeURIComponent(part),
//         )
//         .join("/")}`;
//     }

//     // Handle absolute filesystem paths containing /catalogue/.
//     if (normalisedPath.includes("/catalogue/")) {
//       const cataloguePath = normalisedPath.split("/catalogue/").pop();

//       if (cataloguePath) {
//         return `${BACKEND_URL}/catalogue/${cataloguePath
//           .split("/")
//           .map(encodeURIComponent)
//           .join("/")}`;
//       }
//     }

//     // Handle root-relative image URLs.
//     if (normalisedPath.startsWith("/")) {
//       return apiUrl(normalisedPath);
//     }

//     // Handle a filename associated with a known collection.
//     const collection =
//       item.matched_collection ||
//       item.target ||
//       item.collection ||
//       item.source_collection;

//     if (
//       collection &&
//       ["gold", "prototype", "prototypes"].includes(
//         String(collection).toLowerCase(),
//       )
//     ) {
//       const folder =
//         String(collection).toLowerCase() === "gold"
//           ? "gold"
//           : "prototypes";

//       const filename = normalisedPath.split("/").pop();

//       return `${BACKEND_URL}/catalogue/${folder}/${encodeURIComponent(
//         filename,
//       )}`;
//     }

//     return null;
//   }

//   function getItemName(item, index) {
//     return (
//       item.name ||
//       item.jewellery_name ||
//       item.design_name ||
//       item.title ||
//       item.id ||
//       item.jewellery_id ||
//       `Matching Design ${index + 1}`
//     );
//   }

//   function getItemId(item) {
//     const id =
//       item.design_id ??
//       item.jewellery_id ??
//       item.item_id ??
//       item.id ??
//       item.code ??
//       item._id;

//     return id == null ? "" : String(id);
//   }

//   function getCollection(item) {
//     const collection =
//       item.matched_collection ||
//       item.target ||
//       item.collection ||
//       item.source_collection ||
//       "";

//     if (!collection) return "";

//     const normalised = String(collection).toLowerCase();

//     if (
//       normalised === "prototype" ||
//       normalised === "prototypes"
//     ) {
//       return "Prototype";
//     }

//     if (normalised === "gold") {
//       return "Gold";
//     }

//     return String(collection);
//   }

//   function openResultDetails(item, index) {
//     setSelectedResult({
//       item,
//       imageUrl: getImageUrl(item),
//       name: getItemName(item, index),
//       id: getItemId(item),
//       collection: getCollection(item),
//     });
//   }

//   const formattedCooldown = `${Math.floor(
//     cooldownSeconds / 60,
//   )}:${String(cooldownSeconds % 60).padStart(2, "0")}`;

//   return (
//     <div className="search-page">
//       <Header />

//       <main className="search-main">
//         <section className="search-hero">
//           <div className="search-eyebrow">✦ Jewellery search</div>

//           <h1>
//             Find your <span>jewellery match.</span>
//           </h1>
//         </section>

//         <section className="search-workspace">
//           <div className="search-step">
//             <div className="search-step-heading">
//               <span>01</span>
//               <div>
//                 <h2>Choose search mode</h2>
//               </div>
//             </div>

//             <SearchModeSelector
//               value={searchMode}
//               onChange={handleSearchModeChange}
//             />
//           </div>

//           <div className="search-step">
//             <div className="search-step-heading">
//               <span>02</span>
//               <div>
//                 <h2>Add jewellery image</h2>
//               </div>
//             </div>

//             <ImageUpload
//               image={selectedImage}
//               onImageChange={handleImageChange}
//             />
//           </div>

//           <button
//             type="button"
//             className="find-match-button"
//             onClick={handleSearch}
//             disabled={loading || cooldownSeconds > 0}
//           >
//             <span>
//               {loading
//                 ? "Finding Matches..."
//                 : cooldownSeconds > 0
//                   ? `Find Similar Jewellery (${formattedCooldown})`
//                   : "Find Similar Jewellery"}
//             </span>

//             <strong>
//               {loading ? "…" : cooldownSeconds > 0 ? "⌛" : "→"}
//             </strong>
//           </button>

//           {message && (
//             <div
//               className={`search-message ${
//                 loading
//                   ? "search-message-loading"
//                   : hasSearched && results.length > 0
//                     ? "search-message-success"
//                     : hasSearched
//                       ? "search-message-error"
//                       : ""
//               }`}
//               role="status"
//               aria-live="polite"
//             >
//               {loading && <span className="search-loading-spinner" />}
//               {message}
//             </div>
//           )}
//         </section>

//         {results.length > 0 && (
//           <section className="search-results-section">
//             <div className="search-results-heading">
//               <span>✦ AI-powered results</span>
//               <h2>Similar Jewellery Designs</h2>
//               <p>
//                 Designs identified by the jewellery matching model.
//               </p>
//             </div>

//             <div className="search-results-grid">
//               {results.map((item, index) => {
//                 const imageUrl = getImageUrl(item);
//                 const itemId = getItemId(item);
//                 const name = getItemName(item, index);
//                 const collection = getCollection(item);

//                 return (
//                   <article
//                     className="search-result-card"
//                     key={`${itemId || "design"}-${index}`}
//                   >
//                     <button
//                       type="button"
//                       className="search-result-image"
//                       onClick={() => openResultDetails(item, index)}
//                       aria-label={`View details for ${name}`}
//                     >
//                       {imageUrl && (
//                         <img
//                           src={imageUrl}
//                           alt={name}
//                           loading="lazy"
//                           onError={(event) => {
//                             event.currentTarget.style.display = "none";

//                             event.currentTarget.nextElementSibling?.classList.remove(
//                               "search-image-fallback-hidden",
//                             );
//                           }}
//                         />
//                       )}

//                       <div
//                         className={`search-image-fallback ${
//                           imageUrl ? "search-image-fallback-hidden" : ""
//                         }`}
//                       >
//                         <span>✦</span>
//                         <p>Jewellery image unavailable</p>
//                       </div>
//                     </button>

//                     <div className="search-result-details">
//                       <h3 title={name}>{name}</h3>

//                       {itemId && (
//                         <p className="search-result-id">
//                           ID: {itemId}
//                         </p>
//                       )}

//                       {collection && (
//                         <span className="search-result-collection">
//                           {collection}
//                         </span>
//                       )}

//                       {(item.type || item.jewellery_type) && (
//                         <p className="search-result-type">
//                           Type: {item.type || item.jewellery_type}
//                         </p>
//                       )}
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>
//           </section>
//         )}

//         {hasSearched && results.length === 0 && !loading && (
//           <section className="search-empty-state">
//             <span>✦</span>
//             <h2>No matches found</h2>
//             <p>
//               Try a clearer jewellery image or choose a different search mode.
//             </p>
//           </section>
//         )}

//         <section className="search-how">
//           <div className="search-how-heading">
//             <span>Search workflow</span>
//             <h2>Simple &amp; straightforward</h2>
//           </div>

//           <div className="search-how-grid">
//             <div className="how-card">
//               <strong>01</strong>
//               <h3>Select</h3>
//               <p>
//                 Choose whether to search across all jewellery or between
//                 specific collections.
//               </p>
//             </div>

//             <div className="how-card">
//               <strong>02</strong>
//               <h3>Upload</h3>
//               <p>
//                 Add a clear image of the jewellery design from your device
//                 or camera.
//               </p>
//             </div>

//             <div className="how-card">
//               <strong>03</strong>
//               <h3>Search</h3>
//               <p>
//                 Let the AI model analyse your image and find similar designs.
//               </p>
//             </div>
//           </div>
//         </section>

//         <div className="search-back">
//           <Link to="/catalogue">← Back to Catalogue</Link>
//         </div>
//       </main>

//       <footer className="search-footer">
//         <div>
//           <strong>JewelMatch AI</strong>
//           <span>Jewellery Catalogue</span>
//         </div>

//         <div>© 2026 JewelMatch AI</div>
//       </footer>

//       {/* Jewellery result details popup */}
//       {selectedResult && (
//         <div
//           className="catalogue-details-overlay"
//           onMouseDown={(event) => {
//             if (event.target === event.currentTarget) {
//               closeResultDetails();
//             }
//           }}
//         >
//           <div
//             className="catalogue-details-modal"
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="search-result-modal-title"
//           >
//             <button
//               type="button"
//               className="catalogue-details-close"
//               onClick={closeResultDetails}
//               aria-label="Close jewellery details"
//             >
//               ×
//             </button>

//             <div className="catalogue-details-image">
//               {selectedResult.imageUrl ? (
//                 <img
//                   src={selectedResult.imageUrl}
//                   alt={selectedResult.name}
//                   onError={(event) => {
//                     event.currentTarget.style.display = "none";
//                   }}
//                 />
//               ) : (
//                 <div className="catalogue-details-no-image">
//                   Jewellery image unavailable
//                 </div>
//               )}
//             </div>

//             <div className="catalogue-details-content">
//               <span className="catalogue-details-collection">
//                 {selectedResult.collection || "Jewellery"}
//               </span>

//               <h2 id="search-result-modal-title">
//                 {selectedResult.name}
//               </h2>

//               <div className="catalogue-details-id">
//                 <span>Design ID</span>
//                 <strong>{selectedResult.id || "—"}</strong>
//               </div>

//               <div className="catalogue-details-info-grid">
//                 <div className="catalogue-details-info">
//                   <span>Type</span>
//                   <strong>
//                     {selectedResult.item.type ||
//                       selectedResult.item.jewellery_type ||
//                       "—"}
//                   </strong>
//                 </div>

//                 <div className="catalogue-details-info">
//                   <span>Collection</span>
//                   <strong>{selectedResult.collection || "—"}</strong>
//                 </div>
//               </div>

//               {selectedResult.item.description && (
//                 <div className="catalogue-details-description">
//                   <span>Description</span>
//                   <p>{selectedResult.item.description}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default SearchPage;

// #########################################################
// timer removed

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import SearchModeSelector from "../components/SearchModeSelector";
import ImageUpload from "../components/ImageUpload";

import { matchJewellery, apiUrl } from "../services/api";

import "../styles/search.css";

const BACKEND_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://46.202.167.86:8088"
).replace(/\/+$/, "");

function SearchPage() {
  const [searchMode, setSearchMode] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  function closeResultDetails() {
    setSelectedResult(null);
  }

  // Clean up when the component unmounts.
  useEffect(() => {
    return () => {
      document.body.classList.remove("catalogue-overlay-open");
    };
  }, []);

  // Close the popup with Escape and prevent background scrolling.
  useEffect(() => {
    if (!selectedResult) {
      document.body.classList.remove("catalogue-overlay-open");
      return undefined;
    }

    document.body.classList.add("catalogue-overlay-open");

    function handleEscape(event) {
      if (event.key === "Escape") {
        closeResultDetails();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("catalogue-overlay-open");
    };
  }, [selectedResult]);

  function handleImageChange(image) {
    setSelectedImage(image);
    setMessage("");
    setResults([]);
    setHasSearched(false);
    closeResultDetails();
  }

  function handleSearchModeChange(mode) {
    setSearchMode(mode);
    setMessage("");
    setResults([]);
    setHasSearched(false);
    closeResultDetails();
  }

  async function handleSearch() {
    if (!selectedImage) {
      setMessage("Please upload or capture a jewellery image first.");
      return;
    }

    if (loading) return;

    setLoading(true);
    setMessage("Analysing your jewellery image and finding similar designs...");
    setResults([]);
    setHasSearched(false);
    closeResultDetails();

    try {
      // Use the existing API service and selected search mode.
      const data = await matchJewellery(selectedImage, searchMode, 12);

      const matchedResults = Array.isArray(data?.results) ? data.results : [];

      setResults(matchedResults);
      setHasSearched(true);

      if (matchedResults.length === 0) {
        setMessage(
          "No similar jewellery designs were found. Try another image or search mode.",
        );
      } else {
        setMessage(
          `Search complete. Found ${matchedResults.length} matching design(s).`,
        );
      }
    } catch (error) {
      console.error("Jewellery matching error:", error);

      setMessage(
        error?.message ||
          "Unable to complete the jewellery search. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function getImageUrl(item) {
    if (!item || typeof item !== "object") {
      return null;
    }

    const imageValue =
      item.image_url ||
      item.imageUrl ||
      item.image ||
      item.image_path ||
      item.filename ||
      item.image_filename;

    const gridFsId =
      item.image_gridfs_id ||
      item.gridfs_id ||
      item.image_file_id ||
      item.image_id;

    // Prefer the backend's GridFS image route when an ID is available.
    if (gridFsId) {
      return `${BACKEND_URL}/catalogue-image/stored/${encodeURIComponent(
        String(gridFsId),
      )}`;
    }

    if (!imageValue || typeof imageValue !== "string") {
      return null;
    }

    // Preserve complete external image URLs.
    if (/^https?:\/\//i.test(imageValue)) {
      return imageValue;
    }

    const normalisedPath = imageValue.replace(/\\/g, "/");

    // Handle relative GridFS routes.
    if (normalisedPath.startsWith("/catalogue-image/")) {
      return `${BACKEND_URL}${normalisedPath
        .split("/")
        .map((part, index) =>
          index === 0 || part === "catalogue-image" || part === "stored"
            ? part
            : encodeURIComponent(part),
        )
        .join("/")}`;
    }

    // Handle absolute filesystem paths containing /catalogue/.
    if (normalisedPath.includes("/catalogue/")) {
      const cataloguePath = normalisedPath.split("/catalogue/").pop();

      if (cataloguePath) {
        return `${BACKEND_URL}/catalogue/${cataloguePath
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;
      }
    }

    // Handle root-relative image URLs.
    if (normalisedPath.startsWith("/")) {
      return apiUrl(normalisedPath);
    }

    // Handle a filename associated with a known collection.
    const collection =
      item.matched_collection ||
      item.target ||
      item.collection ||
      item.source_collection;

    if (
      collection &&
      ["gold", "prototype", "prototypes"].includes(
        String(collection).toLowerCase(),
      )
    ) {
      const folder =
        String(collection).toLowerCase() === "gold" ? "gold" : "prototypes";

      const filename = normalisedPath.split("/").pop();

      return `${BACKEND_URL}/catalogue/${folder}/${encodeURIComponent(
        filename,
      )}`;
    }

    return null;
  }

  function getItemName(item, index) {
    return (
      item.name ||
      item.jewellery_name ||
      item.design_name ||
      item.title ||
      item.id ||
      item.jewellery_id ||
      `Matching Design ${index + 1}`
    );
  }

  function getItemId(item) {
    const id =
      item.design_id ??
      item.jewellery_id ??
      item.item_id ??
      item.id ??
      item.code ??
      item._id;

    return id == null ? "" : String(id);
  }

  function getCollection(item) {
    const collection =
      item.matched_collection ||
      item.target ||
      item.collection ||
      item.source_collection ||
      "";

    if (!collection) return "";

    const normalised = String(collection).toLowerCase();

    if (normalised === "prototype" || normalised === "prototypes") {
      return "Prototype";
    }

    if (normalised === "gold") {
      return "Gold";
    }

    return String(collection);
  }

  function openResultDetails(item, index) {
    setSelectedResult({
      item,
      imageUrl: getImageUrl(item),
      name: getItemName(item, index),
      id: getItemId(item),
      collection: getCollection(item),
    });
  }

  return (
    <div className="search-page">
      <Header />

      <main className="search-main">
        <section className="search-hero">
          <div className="search-eyebrow">✦ Jewellery search</div>

          <h1>
            Find your <span>jewellery match.</span>
          </h1>
        </section>

        <section className="search-workspace">
          <div className="search-step">
            <div className="search-step-heading">
              <span>01</span>
              <div>
                <h2>Choose search mode</h2>
              </div>
            </div>

            <SearchModeSelector
              value={searchMode}
              onChange={handleSearchModeChange}
            />
          </div>

          <div className="search-step">
            <div className="search-step-heading">
              <span>02</span>
              <div>
                <h2>Add jewellery image</h2>
              </div>
            </div>

            <ImageUpload
              image={selectedImage}
              onImageChange={handleImageChange}
            />
          </div>

          <button
            type="button"
            className="find-match-button"
            onClick={handleSearch}
            disabled={loading}
          >
            <span>
              {loading ? "Finding Matches..." : "Find Similar Jewellery"}
            </span>

            <strong>{loading ? "…" : "→"}</strong>
          </button>

          {message && (
            <div
              className={`search-message ${
                loading
                  ? "search-message-loading"
                  : hasSearched && results.length > 0
                    ? "search-message-success"
                    : hasSearched
                      ? "search-message-error"
                      : ""
              }`}
              role="status"
              aria-live="polite"
            >
              {loading && <span className="search-loading-spinner" />}
              {message}
            </div>
          )}
        </section>

        {results.length > 0 && (
          <section className="search-results-section">
            <div className="search-results-heading">
              <span>✦ AI-powered results</span>
              <h2>Similar Jewellery Designs</h2>
              <p>Designs identified by the jewellery matching model.</p>
            </div>

            <div className="search-results-grid">
              {results.map((item, index) => {
                const imageUrl = getImageUrl(item);
                const itemId = getItemId(item);
                const name = getItemName(item, index);
                const collection = getCollection(item);

                return (
                  <article
                    className="search-result-card"
                    key={`${itemId || "design"}-${index}`}
                  >
                    <button
                      type="button"
                      className="search-result-image"
                      onClick={() => openResultDetails(item, index)}
                      aria-label={`View details for ${name}`}
                    >
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={name}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";

                            event.currentTarget.nextElementSibling?.classList.remove(
                              "search-image-fallback-hidden",
                            );
                          }}
                        />
                      )}

                      <div
                        className={`search-image-fallback ${
                          imageUrl ? "search-image-fallback-hidden" : ""
                        }`}
                      >
                        <span>✦</span>
                        <p>Jewellery image unavailable</p>
                      </div>
                    </button>

                    <div className="search-result-details">
                      <h3 title={name}>{name}</h3>

                      {itemId && (
                        <p className="search-result-id">ID: {itemId}</p>
                      )}

                      {collection && (
                        <span className="search-result-collection">
                          {collection}
                        </span>
                      )}

                      {(item.type || item.jewellery_type) && (
                        <p className="search-result-type">
                          Type: {item.type || item.jewellery_type}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {hasSearched && results.length === 0 && !loading && (
          <section className="search-empty-state">
            <span>✦</span>
            <h2>No matches found</h2>
            <p>
              Try a clearer jewellery image or choose a different search mode.
            </p>
          </section>
        )}

        <section className="search-how">
          <div className="search-how-heading">
            <span>Search workflow</span>
            <h2>Simple &amp; straightforward</h2>
          </div>

          <div className="search-how-grid">
            <div className="how-card">
              <strong>01</strong>
              <h3>Select</h3>
              <p>
                Choose whether to search across all jewellery or between
                specific collections.
              </p>
            </div>

            <div className="how-card">
              <strong>02</strong>
              <h3>Upload</h3>
              <p>
                Add a clear image of the jewellery design from your device or
                camera.
              </p>
            </div>

            <div className="how-card">
              <strong>03</strong>
              <h3>Search</h3>
              <p>
                Let the AI model analyse your image and find similar designs.
              </p>
            </div>
          </div>
        </section>

        <div className="search-back">
          <Link to="/catalogue">← Back to Catalogue</Link>
        </div>
      </main>

      <footer className="search-footer">
        <div>
          <strong>JewelMatch AI</strong>
          <span>Jewellery Catalogue</span>
        </div>

        <div>© 2026 JewelMatch AI</div>
      </footer>

      {/* Jewellery result details popup */}
      {selectedResult && (
        <div
          className="catalogue-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeResultDetails();
            }
          }}
        >
          <div
            className="catalogue-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-result-modal-title"
          >
            <button
              type="button"
              className="catalogue-details-close"
              onClick={closeResultDetails}
              aria-label="Close jewellery details"
            >
              ×
            </button>

            <div className="catalogue-details-image">
              {selectedResult.imageUrl ? (
                <img
                  src={selectedResult.imageUrl}
                  alt={selectedResult.name}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="catalogue-details-no-image">
                  Jewellery image unavailable
                </div>
              )}
            </div>

            <div className="catalogue-details-content">
              <span className="catalogue-details-collection">
                {selectedResult.collection || "Jewellery"}
              </span>

              <h2 id="search-result-modal-title">{selectedResult.name}</h2>

              <div className="catalogue-details-id">
                <span>Design ID</span>
                <strong>{selectedResult.id || "—"}</strong>
              </div>

              <div className="catalogue-details-info-grid">
                <div className="catalogue-details-info">
                  <span>Type</span>
                  <strong>
                    {selectedResult.item.type ||
                      selectedResult.item.jewellery_type ||
                      "—"}
                  </strong>
                </div>

                <div className="catalogue-details-info">
                  <span>Collection</span>
                  <strong>{selectedResult.collection || "—"}</strong>
                </div>
              </div>

              {selectedResult.item.description && (
                <div className="catalogue-details-description">
                  <span>Description</span>
                  <p>{selectedResult.item.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPage;

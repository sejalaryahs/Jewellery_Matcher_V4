import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import SearchModeSelector from "../components/SearchModeSelector";
import ImageUpload from "../components/ImageUpload";

import { matchJewellery, apiUrl, MATCH_API_URL } from "../services/api";

import "../styles/search.css";

// New matching API server (port 5002).
const MATCH_BACKEND_URL = MATCH_API_URL.replace(/\/+$/, "");

function SearchPage() {
  const [searchMode, setSearchMode] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // -------------------------------------------------------
  // RESULT DETAILS POPUP
  // -------------------------------------------------------

  function closeResultDetails() {
    setSelectedResult(null);
  }

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

  useEffect(() => {
    return () => {
      document.body.classList.remove("catalogue-overlay-open");
    };
  }, []);

  // -------------------------------------------------------
  // IMAGE AND SEARCH MODE HANDLERS
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // SEARCH HANDLER
  // -------------------------------------------------------

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
      console.log("Selected search mode:", searchMode);

      // api.js decides which collection(s) to search.
      const data = await matchJewellery(selectedImage, searchMode, 12);

      const matchedResults = Array.isArray(data?.results) ? data.results : [];

      console.log("Matching API response:", data);
      console.log("Matching results:", matchedResults);

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

      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------
  // IMAGE URL HANDLER
  // -------------------------------------------------------

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

    // Use the new matching server for GridFS images.
    if (gridFsId) {
      return `${MATCH_BACKEND_URL}/catalogue-image/stored/${encodeURIComponent(
        String(gridFsId),
      )}`;
    }

    if (!imageValue || typeof imageValue !== "string") {
      return null;
    }

    // Preserve complete external URLs, including Supabase URLs.
    if (/^https?:\/\//i.test(imageValue)) {
      return imageValue;
    }

    const normalisedPath = imageValue.replace(/\\/g, "/");

    // Handle relative GridFS routes.
    if (normalisedPath.startsWith("/catalogue-image/")) {
      return `${MATCH_BACKEND_URL}${normalisedPath}`;
    }

    // Handle filesystem paths containing /catalogue/.
    if (normalisedPath.includes("/catalogue/")) {
      const cataloguePath = normalisedPath.split("/catalogue/").pop();

      if (cataloguePath) {
        return `${MATCH_BACKEND_URL}/catalogue/${cataloguePath
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;
      }
    }

    // Handle other root-relative image URLs through catalogue API.
    if (normalisedPath.startsWith("/")) {
      return apiUrl(normalisedPath);
    }

    // Handle relative filenames with a known collection.
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

      return `${MATCH_BACKEND_URL}/catalogue/${folder}/${encodeURIComponent(
        filename,
      )}`;
    }

    return null;
  }

  // -------------------------------------------------------
  // RESULT INFORMATION HELPERS
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // OPEN RESULT DETAILS
  // -------------------------------------------------------

  function openResultDetails(item, index) {
    setSelectedResult({
      item,
      imageUrl: getImageUrl(item),
      name: getItemName(item, index),
      id: getItemId(item),
      collection: getCollection(item),
    });
  }

  // -------------------------------------------------------
  // PAGE UI
  // -------------------------------------------------------

  return (
    <div className="search-page">
      <Header />

      <main className="search-main">
        {/* HERO */}
        <section className="search-hero">
          <div className="search-eyebrow">✦ Jewellery search</div>

          <h1>
            Find your <span>jewellery match.</span>
          </h1>
        </section>

        {/* SEARCH WORKSPACE */}
        <section className="search-workspace">
          {/* SEARCH MODE */}
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

          {/* IMAGE UPLOAD */}
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

          {/* SEARCH BUTTON */}
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

          {/* STATUS MESSAGE */}
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

        {/* SEARCH RESULTS */}
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

        {/* EMPTY RESULTS */}
        {hasSearched && results.length === 0 && !loading && (
          <section className="search-empty-state">
            <span>✦</span>
            <h2>No matches found</h2>
            <p>
              Try a clearer jewellery image or choose a different search mode.
            </p>
          </section>
        )}

        {/* HOW IT WORKS */}
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

        {/* BACK TO CATALOGUE */}
        <div className="search-back">
          <Link to="/catalogue">← Back to Catalogue</Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="search-footer">
        <div>
          <strong>JewelMatch AI</strong>
          <span>Jewellery Catalogue</span>
        </div>

        <div>© 2026 JewelMatch AI</div>
      </footer>

      {/* RESULT DETAILS POPUP */}
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

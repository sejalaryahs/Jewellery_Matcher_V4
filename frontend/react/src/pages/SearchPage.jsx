import { useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import SearchModeSelector from "../components/SearchModeSelector";
import ImageUpload from "../components/ImageUpload";

import { matchJewellery, apiUrl } from "../services/api";

import "../styles/search.css";

function SearchPage() {
  const [searchMode, setSearchMode] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  function handleImageChange(image) {
    setSelectedImage(image);
    setMessage("");
    setResults([]);
    setHasSearched(false);
  }

  function handleSearchModeChange(mode) {
    setSearchMode(mode);
    setMessage("");
    setResults([]);
    setHasSearched(false);
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

    try {
      const data = await matchJewellery(selectedImage, searchMode, 8);
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
        error.message ||
          "Unable to complete the jewellery search. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function getSimilarity(item) {
    const rawScore =
      item.similarity ??
      item.score ??
      item.match_score ??
      item.similarity_score;

    if (rawScore === undefined || rawScore === null) {
      return null;
    }

    const numericScore = Number(rawScore);

    if (!Number.isFinite(numericScore)) {
      return null;
    }

    // Scores between 0 and 1 are treated as proportions.
    const percentage =
      numericScore >= 0 && numericScore <= 1
        ? numericScore * 100
        : numericScore;

    return Math.max(0, Math.min(100, percentage));
  }

  function getImageUrl(item) {
    const imageValue =
      item.image_url ||
      item.image ||
      item.image_path ||
      item.filename ||
      item.image_filename;

    if (!imageValue || typeof imageValue !== "string") {
      return null;
    }

    // Preserve complete external URLs.
    if (/^https?:\/\//i.test(imageValue)) {
      return imageValue;
    }

    // Handle a stored GridFS image if the result includes its ID.
    // const gridFsId = item.gridfs_id || item.image_id || item.image_file_id;
    const gridFsId =
      item.image_gridfs_id ||
      item.gridfs_id ||
      item.image_id ||
      item.image_file_id;

    if (gridFsId) {
      return `https://jewelmatchai-model.onrender.com/catalogue-image/stored/${encodeURIComponent(
        gridFsId,
      )}`;
    }

    // Convert Windows paths to URL-style paths.
    const normalisedPath = imageValue.replace(/\\/g, "/");

    // The model service serves catalogue files from this route.
    if (normalisedPath.includes("/catalogue/")) {
      const cataloguePath = normalisedPath.split("/catalogue/").pop();

      if (cataloguePath) {
        return `https://jewelmatchai-model.onrender.com/catalogue/${cataloguePath
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;
      }
    }

    // Handle relative image URLs already provided by the API.
    if (normalisedPath.startsWith("/")) {
      return apiUrl(normalisedPath);
    }

    // Handle a relative filename with a known collection.
    const collection =
      item.collection || item.matched_collection || item.source_collection;

    if (
      collection &&
      ["gold", "prototype", "prototypes"].includes(
        String(collection).toLowerCase(),
      )
    ) {
      const domain =
        String(collection).toLowerCase() === "gold" ? "gold" : "prototypes";

      const filename = normalisedPath.split("/").pop();

      return `https://jewelmatchai-model.onrender.com/catalogue/${domain}/${encodeURIComponent(
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
    return (
      item.jewellery_id ||
      item.item_id ||
      item.id ||
      item.code ||
      item._id ||
      ""
    );
  }

  function getCollection(item) {
    const collection =
      item.matched_collection ||
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
                const similarity = getSimilarity(item);
                const itemId = getItemId(item);
                const collection = getCollection(item);

                return (
                  <article
                    className="search-result-card"
                    key={`${itemId || "design"}-${index}`}
                  >
                    <div className="search-result-image">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={getItemName(item, index)}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling?.classList.remove(
                              "search-image-fallback-hidden",
                            );
                          }}
                        />
                      ) : null}

                      <div
                        className={`search-image-fallback ${
                          imageUrl ? "search-image-fallback-hidden" : ""
                        }`}
                      >
                        <span>✦</span>
                        <p>Jewellery image unavailable</p>
                      </div>

                      {similarity !== null && (
                        <div className="search-similarity-badge">
                          {similarity.toFixed(1)}% match
                        </div>
                      )}
                    </div>

                    <div className="search-result-details">
                      <h3>{getItemName(item, index)}</h3>

                      {itemId && (
                        <p className="search-result-id">ID: {String(itemId)}</p>
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

                      {similarity !== null && (
                        <div className="search-similarity">
                          <div className="search-similarity-label">
                            <span>Similarity score</span>
                            <strong>{similarity.toFixed(1)}%</strong>
                          </div>

                          <div className="search-similarity-track">
                            <div
                              className="search-similarity-fill"
                              style={{ width: `${similarity}%` }}
                            />
                          </div>
                        </div>
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
    </div>
  );
}

export default SearchPage;

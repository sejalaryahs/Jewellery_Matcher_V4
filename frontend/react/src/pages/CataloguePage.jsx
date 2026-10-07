import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import CatalogueCard from "../components/CatalogueCard";

import { getCatalogue } from "../services/api";

import "../styles/catalogue.css";

/* =========================================================
   JEWELLERY TYPES
========================================================= */

const JEWELLERY_TYPES = [
  "LP",
  "GP",
  "LAD",
  "GAD",
  "SSL",
  "SSG",
  "WB",
  "EMROLD",
  "KACHUWA TORTOISE",
  "CHALA MIX",
  "OMP",
  "GF",
  "FOTO",
  "LBR",
  "GBR",
  "PENDELS",
  "HIGHPOLISHCHARMS",
  "CUTTING CHARMS",
  "LCH",
  "SIMBA",
  "LETTERS",
  "OMRING",
  "RAJMUDRA",
  "OTHERS EXTRA",
  "GCH",
];

/* =========================================================
   HELPERS
========================================================= */

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getImageUrl(item) {
  const value = item?.image_url || item?.image || item?.image_path || "";

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
}

/* =========================================================
   CATALOGUE PAGE
========================================================= */

function CataloguePage() {
  const [items, setItems] = useState([]);

  // const [totalCount, setTotalCount] = useState(0);
  // const [goldCount, setGoldCount] = useState(0);
  // const [prototypeCount, setPrototypeCount] = useState(0);

  const [collection, setCollection] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [search, setSearch] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD CATALOGUE
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogue() {
      try {
        setLoading(true);
        setError("");

        const response = await getCatalogue({
          collection,
          search,
        });

        if (cancelled) {
          return;
        }

        const catalogueItems = Array.isArray(response?.items)
          ? response.items
          : [];

        setItems(catalogueItems);

        // setTotalCount(Number(response?.total_count ?? catalogueItems.length));

        // setGoldCount(Number(response?.gold_count ?? 0));

        // setPrototypeCount(Number(response?.prototype_count ?? 0));
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Unable to load the jewellery catalogue.");

          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCatalogue();

    return () => {
      cancelled = true;
    };
  }, [collection, search]);

  /* =======================================================
     FILTER BY TYPE
  ======================================================= */

  const filteredItems = useMemo(() => {
    if (selectedType === "all") {
      return items;
    }

    const selected = normalizeValue(selectedType);

    return items.filter((item) => {
      return normalizeValue(item?.type) === selected;
    });
  }, [items, selectedType]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setCollection("all");
    setSelectedType("all");
    setSearch("");
  }

  /* =======================================================
     OPEN DETAILS
  ======================================================= */

  function openDetails(item) {
    setSelectedItem(item);

    document.body.classList.add("catalogue-overlay-open");
  }

  /* =======================================================
     CLOSE DETAILS
  ======================================================= */

  function closeDetails() {
    setSelectedItem(null);

    document.body.classList.remove("catalogue-overlay-open");
  }

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" && selectedItem) {
        closeDetails();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);

      document.body.classList.remove("catalogue-overlay-open");
    };
  }, [selectedItem]);

  /* =======================================================
     SELECTED ITEM IMAGE
  ======================================================= */

  const selectedImageUrl = selectedItem ? getImageUrl(selectedItem) : "";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="catalogue-page">
      <Header />

      <main className="catalogue-main">
        {/* =================================================
            HEADING
        ================================================= */}

        <section className="catalogue-heading">
          <div className="catalogue-eyebrow">✦ Jewellery catalogue</div>

          <h1>
            Explore the <span>collection.</span>
          </h1>

          <p>
            Browse and manage the jewellery designs available in your catalogue.
          </p>

          <div className="catalogue-heading-actions">
            <Link to="/search" className="catalogue-search-page-button">
              <span>Search Jewellery</span>
              <strong>→</strong>
            </Link>
          </div>
        </section>

        {/* =================================================
            FILTER PANEL
        ================================================= */}

        <section className="catalogue-filter-panel">
          {/* SEARCH */}

          <div className="catalogue-search-row">
            <div className="catalogue-search">
              <span className="catalogue-search-icon">⌕</span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ID, name or type..."
                aria-label="Search jewellery"
              />

              {search && (
                <button
                  type="button"
                  className="catalogue-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* FILTERS */}

          <div className="catalogue-filter-row">
            <div className="catalogue-filter-group">
              <span className="catalogue-filter-label">Collection</span>

              <div className="catalogue-collection-filters">
                <button
                  type="button"
                  className={collection === "all" ? "active" : ""}
                  onClick={() => setCollection("all")}
                >
                  All
                </button>

                <button
                  type="button"
                  className={collection === "gold" ? "active" : ""}
                  onClick={() => setCollection("gold")}
                >
                  Gold
                </button>

                <button
                  type="button"
                  className={collection === "prototype" ? "active" : ""}
                  onClick={() => setCollection("prototype")}
                >
                  Prototype
                </button>
              </div>
            </div>

            <div className="catalogue-filter-group catalogue-type-filter">
              <label
                htmlFor="catalogue-jewellery-type"
                className="catalogue-filter-label"
              >
                Jewellery Type
              </label>

              <div className="catalogue-type-select-wrapper">
                <select
                  id="catalogue-jewellery-type"
                  value={selectedType}
                  onChange={(event) => setSelectedType(event.target.value)}
                >
                  <option value="all">All Jewellery Types</option>

                  {JEWELLERY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <span className="catalogue-select-arrow">▾</span>
              </div>
            </div>

            {(collection !== "all" ||
              selectedType !== "all" ||
              search.trim()) && (
              <button
                type="button"
                className="catalogue-clear-filters"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* =================================================
            RESULT BAR
        ================================================= */}

        <div className="catalogue-result-bar">
          <div>
            <span className="catalogue-result-label">Jewellery Designs</span>

            <strong>{filteredItems.length}</strong>
          </div>

          {(collection !== "all" ||
            selectedType !== "all" ||
            search.trim()) && (
            <span className="catalogue-filter-active">Filters applied</span>
          )}
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && <div className="catalogue-message error">{error}</div>}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="catalogue-loading">
            <div className="catalogue-loading-spinner" />

            <p>Loading jewellery catalogue...</p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && !error && filteredItems.length === 0 && (
          <div className="catalogue-empty-state">
            <div className="catalogue-empty-icon">✦</div>

            <h2>No jewellery found</h2>

            <p>Try changing your search or filters.</p>

            <button type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {/* =================================================
            CATALOGUE CARDS
        ================================================= */}

        {!loading && filteredItems.length > 0 && (
          <section className="catalogue-grid">
            {filteredItems.map((item) => (
              <CatalogueCard
                key={item?.design_id || item?.id}
                item={item}
                onClick={openDetails}
              />
            ))}
          </section>
        )}
      </main>

      {/* ===================================================
          JEWELLERY DETAILS OVERLAY
      =================================================== */}

      {selectedItem && (
        <div
          className="catalogue-details-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div
            className="catalogue-details-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Jewellery details"
          >
            {/* CLOSE */}

            <button
              type="button"
              className="catalogue-details-close"
              onClick={closeDetails}
              aria-label="Close jewellery details"
            >
              ×
            </button>

            {/* =================================================
                IMAGE — MAIN FOCUS
            ================================================= */}

            <div className="catalogue-details-image">
              {selectedImageUrl ? (
                <img
                  src={selectedImageUrl}
                  alt={selectedItem?.name || "Jewellery"}
                />
              ) : (
                <div className="catalogue-details-no-image">
                  No image available
                </div>
              )}
            </div>

            {/* =================================================
                DETAILS
            ================================================= */}

            <div className="catalogue-details-content">
              <span className="catalogue-details-collection">
                {selectedItem?.collection || "—"}
              </span>

              <h2>
                {selectedItem?.name ||
                  selectedItem?.design_name ||
                  "Untitled Jewellery"}
              </h2>

              <div className="catalogue-details-id">
                <span>Design ID</span>

                <strong>
                  {selectedItem?.design_id || selectedItem?.id || "—"}
                </strong>
              </div>

              <div className="catalogue-details-info-grid">
                <div className="catalogue-details-info">
                  <span>Type</span>

                  <strong>{selectedItem?.type || "—"}</strong>
                </div>

                <div className="catalogue-details-info">
                  <span>Collection</span>

                  <strong>{selectedItem?.collection || "—"}</strong>
                </div>
              </div>

              {selectedItem?.description && (
                <div className="catalogue-details-description">
                  <span>Description</span>

                  <p>{selectedItem.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CataloguePage;

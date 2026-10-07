import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import CatalogueCard from "../components/CatalogueCard";

import {
  getCatalogue,
  updateJewellery,
  deleteJewellery,
} from "../services/api";

import "../styles/catalogue.css";

/* =========================================================
   JEWELLERY TYPES
   Same list used by Add Jewellery
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

function getItemId(item) {
  return item?.design_id || item?.id || item?._id || "";
}

function getItemName(item) {
  return item?.name || item?.design_name || "";
}

function getItemCollection(item) {
  return item?.collection || "";
}

function getItemType(item) {
  return item?.type || "";
}

function getItemDescription(item) {
  return item?.description || "";
}

/* =========================================================
   PAGE
========================================================= */

function ManageJewelleryPage() {
  const [items, setItems] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    gold: 0,
    prototype: 0,
  });
  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * Selected item for the small
   * Manage popup.
   */
  const [managingItem, setManagingItem] = useState(null);

  /*
   * Item currently being edited.
   */
  const [editingItem, setEditingItem] = useState(null);

  /*
   * Item waiting for delete confirmation.
   */
  const [deletingItem, setDeletingItem] = useState(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  /* =======================================================
     EDIT FORM
  ======================================================= */

  const [editName, setEditName] = useState("");

  const [editCollection, setEditCollection] = useState("Gold");

  const [editType, setEditType] = useState("");

  const [editDescription, setEditDescription] = useState("");

  const [editImage, setEditImage] = useState(null);

  const [editImagePreview, setEditImagePreview] = useState("");

  /* =======================================================
     LOAD CATALOGUE
  ======================================================= */

  async function loadCatalogue() {
    try {
      setLoading(true);
      setError("");

      const response = await getCatalogue();

      const catalogue =
        response?.items || response?.catalogue || response?.data || [];

      const catalogueItems = Array.isArray(catalogue) ? catalogue : [];

      setItems(catalogueItems);

      setStatistics({
        total: Number(response?.total_count) || catalogueItems.length,

        gold:
          Number(response?.gold_count) ||
          catalogueItems.filter(
            (item) => String(getItemCollection(item)).toLowerCase() === "gold",
          ).length,

        prototype:
          Number(response?.prototype_count) ||
          catalogueItems.filter(
            (item) =>
              String(getItemCollection(item)).toLowerCase() === "prototype",
          ).length,
      });
    } catch (err) {
      console.error("Failed to load jewellery:", err);

      setError(err.message || "Unable to load jewellery.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalogue();
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const id = String(getItemId(item)).toLowerCase();

      const name = getItemName(item).toLowerCase();

      const type = getItemType(item).toLowerCase();

      const itemCollection = getItemCollection(item).toLowerCase();

      const matchesSearch =
        !query ||
        id.includes(query) ||
        name.includes(query) ||
        type.includes(query) ||
        itemCollection.includes(query);

      const matchesCollection =
        collection === "all" || itemCollection === collection.toLowerCase();

      return matchesSearch && matchesCollection;
    });
  }, [items, search, collection]);

  /* =======================================================
     OPEN MANAGE POPUP
  ======================================================= */

  function openManage(item) {
    setError("");
    setSuccess("");

    setManagingItem(item);
  }

  /* =======================================================
     CLOSE MANAGE POPUP
  ======================================================= */

  function closeManage() {
    if (saving || deleting) {
      return;
    }

    setManagingItem(null);
  }

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  function openEdit(item) {
    setError("");
    setSuccess("");

    setEditingItem(item);

    setEditName(getItemName(item));

    setEditCollection(getItemCollection(item) || "Gold");

    setEditType(getItemType(item));

    setEditDescription(getItemDescription(item));

    setEditImage(null);

    /*
     * Use the same image field that
     * CatalogueCard understands.
     */
    const image = item?.image_url || item?.image || item?.image_path || "";

    setEditImagePreview(image);

    setManagingItem(null);
  }

  /* =======================================================
     CLOSE EDIT
  ======================================================= */

  function closeEdit() {
    if (saving) {
      return;
    }

    setEditingItem(null);
    setEditImage(null);
    setEditImagePreview("");
  }

  /* =======================================================
     IMAGE CHANGE
  ======================================================= */

  function handleEditImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setEditImage(file);

    const preview = URL.createObjectURL(file);

    setEditImagePreview(preview);
  }

  /* =======================================================
     SAVE EDIT
  ======================================================= */

  async function handleSaveEdit(event) {
    event.preventDefault();

    if (!editingItem) {
      return;
    }

    const id = getItemId(editingItem);

    if (!id) {
      setError("Jewellery ID is missing.");

      return;
    }

    if (!editName.trim()) {
      setError("Please enter the jewellery name.");

      return;
    }

    if (!editCollection) {
      setError("Please select a collection.");

      return;
    }

    if (!editType) {
      setError("Please select a jewellery type.");

      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateJewellery({
        id,
        image: editImage,
        name: editName.trim(),
        collection: editCollection,
        type: editType,
        description: editDescription.trim(),
      });

      setSuccess("Jewellery updated successfully.");

      setEditingItem(null);
      setEditImage(null);
      setEditImagePreview("");

      await loadCatalogue();

      /*
       * Keep success message visible
       * briefly on the page.
       */
      window.setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      console.error("Failed to update jewellery:", err);

      setError(err.message || "Unable to update jewellery.");
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     OPEN DELETE CONFIRMATION
  ======================================================= */

  function openDelete(item) {
    setError("");
    setSuccess("");

    setDeletingItem(item);
    setManagingItem(null);
  }

  /* =======================================================
     CLOSE DELETE
  ======================================================= */

  function closeDelete() {
    if (deleting) {
      return;
    }

    setDeletingItem(null);
  }

  /* =======================================================
     CONFIRM DELETE
  ======================================================= */

  async function handleDelete() {
    if (!deletingItem) {
      return;
    }

    const id = getItemId(deletingItem);

    if (!id) {
      setError("Jewellery ID is missing.");

      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteJewellery(id);

      setDeletingItem(null);

      setSuccess("Jewellery deleted successfully.");

      await loadCatalogue();

      window.setTimeout(() => {
        setSuccess("");
      }, 3500);
    } catch (err) {
      console.error("Failed to delete jewellery:", err);

      setError(err.message || "Unable to delete jewellery.");
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="catalogue-page">
      <Header />

      <main className="catalogue-main">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="catalogue-hero management-page-hero">
          <div>
            <span className="catalogue-eyebrow">JEWELLERY MANAGEMENT</span>

            <h1>Manage Jewellery</h1>

            {/* <p>Search, edit or remove jewellery from your catalogue.</p> */}
          </div>

          <Link to="/add-jewellery" className="management-add-link">
            + Add Jewellery
          </Link>
        </section>

        {/* =================================================
            KPI STATISTICS
        ================================================= */}

        <section className="catalogue-statistics management-statistics">
          <div className="catalogue-stat">
            <span>Total Designs</span>

            <strong>{statistics.total}</strong>
          </div>

          <div className="catalogue-stat">
            <span>Gold</span>

            <strong>{statistics.gold}</strong>
          </div>

          <div className="catalogue-stat">
            <span>Prototype</span>

            <strong>{statistics.prototype}</strong>
          </div>
        </section>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="management-alert success">
            <span>✓</span>
            {success}
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="management-alert error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="management-toolbar">
          <div className="management-search">
            <span className="management-search-icon">⌕</span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID, name or type..."
            />

            {search && (
              <button
                type="button"
                className="management-search-clear"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="management-filter">
            <label htmlFor="collection-filter">Collection</label>

            <select
              id="collection-filter"
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
            >
              <option value="all">All Collections</option>

              <option value="Gold">Gold</option>

              <option value="Prototype">Prototype</option>
            </select>
          </div>
        </section>

        {/* =================================================
            RESULTS SUMMARY
        ================================================= */}

        {!loading && (
          <div className="management-results-summary">
            {/* <span>
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "jewellery" : "jewellery pieces"}
            </span> */}

            {(search || collection !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCollection("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="management-state">
            <div className="management-spinner" />

            <p>Loading jewellery...</p>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading && filteredItems.length === 0 && (
          <div className="management-empty">
            <div className="management-empty-icon">◇</div>

            <h2>No jewellery found</h2>

            <p>Try a different search or collection filter.</p>

            {(search || collection !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCollection("all");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* =================================================
            JEWELLERY GRID
        ================================================= */}

        {!loading && filteredItems.length > 0 && (
          <section className="catalogue-grid management-grid">
            {filteredItems.map((item) => (
              <CatalogueCard
                key={getItemId(item)}
                item={item}
                managementMode={true}
                onManage={openManage}
              />
            ))}
          </section>
        )}
      </main>

      {/* ===================================================
          SMALL MANAGE POPUP
      =================================================== */}

      {managingItem && (
        <div
          className="management-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeManage();
            }
          }}
        >
          <div
            className="management-detail-modal"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="management-modal-close"
              onClick={closeManage}
              aria-label="Close"
            >
              ×
            </button>

            <div className="management-detail-image">
              {managingItem?.image_url ||
              managingItem?.image ||
              managingItem?.image_path ? (
                <img
                  src={
                    managingItem.image_url ||
                    managingItem.image ||
                    managingItem.image_path
                  }
                  alt={getItemName(managingItem)}
                />
              ) : (
                <div className="management-no-image">No image</div>
              )}
            </div>

            <div className="management-detail-info">
              <span className="management-detail-id">
                {getItemId(managingItem)}
              </span>

              <h2>{getItemName(managingItem)}</h2>

              <div className="management-detail-meta">
                <div>
                  <span>Collection</span>

                  <strong>{getItemCollection(managingItem) || "—"}</strong>
                </div>

                <div>
                  <span>Type</span>

                  <strong>{getItemType(managingItem) || "—"}</strong>
                </div>
              </div>

              {getItemDescription(managingItem) && (
                <p className="management-detail-description">
                  {getItemDescription(managingItem)}
                </p>
              )}

              <div className="management-detail-actions">
                <button
                  type="button"
                  className="management-edit-button"
                  onClick={() => openEdit(managingItem)}
                >
                  Edit Jewellery
                </button>

                <button
                  type="button"
                  className="management-delete-button"
                  onClick={() => openDelete(managingItem)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          EDIT POPUP
      =================================================== */}

      {editingItem && (
        <div
          className="management-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeEdit();
            }
          }}
        >
          <form className="management-edit-modal" onSubmit={handleSaveEdit}>
            <div className="management-edit-header">
              <div>
                <span>EDIT JEWELLERY</span>

                <h2>{getItemId(editingItem)}</h2>
              </div>

              <button
                type="button"
                className="management-modal-close"
                onClick={closeEdit}
                disabled={saving}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="management-edit-body">
              {/* IMAGE */}

              <div className="management-edit-image-section">
                <div className="management-edit-image">
                  {editImagePreview ? (
                    <img src={editImagePreview} alt="Jewellery preview" />
                  ) : (
                    <div className="management-no-image">No image</div>
                  )}
                </div>

                <label className="management-image-upload">
                  <span>Replace Image</span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />
                </label>
              </div>

              {/* FIELDS */}

              <div className="management-edit-fields">
                <div className="management-field">
                  <label htmlFor="edit-name">Jewellery Name</label>

                  <input
                    id="edit-name"
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    placeholder="Enter jewellery name"
                    disabled={saving}
                  />
                </div>

                <div className="management-field">
                  <label htmlFor="edit-collection">Collection</label>

                  <select
                    id="edit-collection"
                    value={editCollection}
                    onChange={(event) => setEditCollection(event.target.value)}
                    disabled={saving}
                  >
                    <option value="Gold">Gold</option>

                    <option value="Prototype">Prototype</option>
                  </select>
                </div>

                <div className="management-field">
                  <label htmlFor="edit-type">Jewellery Type</label>

                  <select
                    id="edit-type"
                    value={editType}
                    onChange={(event) => setEditType(event.target.value)}
                    disabled={saving}
                  >
                    <option value="">Select jewellery type</option>

                    {JEWELLERY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="management-field management-field-full">
                  <label htmlFor="edit-description">Description</label>

                  <textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    placeholder="Enter jewellery description"
                    rows={4}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="management-edit-footer">
              <button
                type="button"
                className="management-cancel-button"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="management-save-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================
          DELETE CONFIRMATION
      =================================================== */}

      {deletingItem && (
        <div
          className="management-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              closeDelete();
            }
          }}
        >
          <div className="delete-confirmation-modal">
            <div className="delete-warning-icon">!</div>

            <span className="delete-confirmation-label">DELETE JEWELLERY</span>

            <h2>Are you sure?</h2>

            <p>
              You are about to delete{" "}
              <strong>
                {getItemName(deletingItem) || getItemId(deletingItem)}
              </strong>
              .
              <br />
              This action cannot be undone.
            </p>

            <div className="delete-confirmation-actions">
              <button
                type="button"
                className="management-cancel-button"
                onClick={closeDelete}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="management-delete-confirm-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageJewelleryPage;

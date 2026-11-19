/* =========================================================
   IMAGE URL
========================================================= */

function getImageUrl(item) {
  const value = item?.image_url || item?.image || "";

  if (!value) {
    return "";
  }

  // Supabase public URL or another absolute image URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Data URL or blob URL
  if (value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  // No valid image URL
  return "";
}

/* =========================================================
   CATALOGUE CARD
========================================================= */

function CatalogueCard({ item, onClick, onManage, managementMode = false }) {
  const imageUrl = getImageUrl(item);

  // Display human-readable jewellery ID
  const designId = item?.design_code || item?.design_id || item?.id || "—";

  const name = item?.name || item?.design_name || "Untitled Jewellery";

  const collection = item?.collection || "—";

  const type = item?.type || "—";

  /* =========================================================
     CARD CLICK
  ========================================================= */

  function handleCardClick() {
    if (managementMode) {
      onManage?.(item);
      return;
    }

    onClick?.(item);
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <article className="catalogue-card">
      {/* IMAGE */}

      <button
        type="button"
        className="catalogue-card-image-button"
        onClick={handleCardClick}
        aria-label={`View ${name}`}
      >
        <div className="catalogue-card-image">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              onError={(event) => {
                console.error(
                  "Jewellery image failed to load:",
                  event.currentTarget.src,
                );
              }}
            />
          ) : (
            <div className="catalogue-no-image">No image</div>
          )}

          {/* HUMAN-READABLE ID */}

          <span className="catalogue-id">{designId}</span>
        </div>
      </button>

      {/* CARD DETAILS */}

      <div className="catalogue-card-body">
        <button
          type="button"
          className="catalogue-card-title-button"
          onClick={handleCardClick}
        >
          <span className="catalogue-small-label">{collection}</span>

          <h3>{name}</h3>
        </button>

        {/* TYPE */}

        <div className="catalogue-card-meta">
          <span>Type</span>

          <strong>{type}</strong>
        </div>

        {/* MANAGEMENT MODE */}

        {managementMode && (
          <button
            type="button"
            className="catalogue-manage-button"
            onClick={(event) => {
              event.stopPropagation();

              onManage?.(item);
            }}
          >
            Manage
            <span>→</span>
          </button>
        )}
      </div>
    </article>
  );
}

export default CatalogueCard;

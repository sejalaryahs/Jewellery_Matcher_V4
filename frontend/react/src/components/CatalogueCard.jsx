import { apiUrl } from "../services/api";

function getImageUrl(item) {
  const value = item?.image_url || item?.image || item?.image_path || "";

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (value.startsWith("/")) {
    return apiUrl(value);
  }

  return apiUrl(`/${value}`);
}

function CatalogueCard({ item, onClick, onManage, managementMode = false }) {
  const imageUrl = getImageUrl(item);

  const designId = item?.design_id || item?.id || "—";

  const name = item?.name || item?.design_name || "Untitled Jewellery";

  const collection = item?.collection || "—";

  const type = item?.type || "—";

  function handleCardClick() {
    if (managementMode) {
      onManage?.(item);
      return;
    }

    onClick?.(item);
  }

  return (
    <article className="catalogue-card">
      <button
        type="button"
        className="catalogue-card-image-button"
        onClick={handleCardClick}
        aria-label={`View ${name}`}
      >
        <div className="catalogue-card-image">
          {imageUrl ? (
            <img src={imageUrl} alt={name} loading="lazy" />
          ) : (
            <div className="catalogue-no-image">No image</div>
          )}

          <span className="catalogue-id">{designId}</span>
        </div>
      </button>

      <div className="catalogue-card-body">
        <button
          type="button"
          className="catalogue-card-title-button"
          onClick={handleCardClick}
        >
          <span className="catalogue-small-label">{collection}</span>

          <h3>{name}</h3>
        </button>

        <div className="catalogue-card-meta">
          <span>Type</span>

          <strong>{type}</strong>
        </div>

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

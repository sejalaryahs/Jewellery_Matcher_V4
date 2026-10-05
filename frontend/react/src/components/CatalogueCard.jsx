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

function CatalogueCard({ item, onClick }) {
  const imageUrl = getImageUrl(item);

  const designId = item?.design_id || item?.id || "—";

  const name = item?.name || item?.design_name || "Untitled Jewellery";

  const collection = item?.collection || "—";

  const type = item?.type || "—";

  return (
    <button
      type="button"
      className="catalogue-card"
      onClick={() => onClick?.(item)}
      aria-label={`View details for ${name}`}
    >
      {/* IMAGE */}

      <div className="catalogue-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={name} loading="lazy" />
        ) : (
          <div className="catalogue-no-image">No image</div>
        )}

        <span className="catalogue-id">{designId}</span>
      </div>

      {/* CARD DETAILS */}

      <div className="catalogue-card-body">
        <span className="catalogue-small-label">{collection}</span>

        <h3>{name}</h3>

        <div className="catalogue-card-meta">
          <span>Type</span>

          <strong>{type}</strong>
        </div>
      </div>
    </button>
  );
}

export default CatalogueCard;

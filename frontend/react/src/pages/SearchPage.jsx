import { useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import SearchModeSelector from "../components/SearchModeSelector";
import ImageUpload from "../components/ImageUpload";

import "../styles/search.css";

function SearchPage() {
  const [searchMode, setSearchMode] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState("");

  function handleImageChange(image) {
    setSelectedImage(image);
    setMessage("");
  }

  function handleSearch() {
    if (!selectedImage) {
      setMessage("Please upload or capture a jewellery image first.");
      return;
    }

    setMessage(
      "Search is ready. The matching service will be connected separately.",
    );
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

          <p>
            Select a search direction and upload a jewellery image to begin your
            catalogue search.
          </p>
        </section>

        <section className="search-workspace">
          <div className="search-step">
            <div className="search-step-heading">
              <span>01</span>

              <div>
                <h2>Choose search mode</h2>

                <p>
                  Select the jewellery collections you want to search between.
                </p>
              </div>
            </div>

            <SearchModeSelector
              value={searchMode}
              onChange={(mode) => {
                setSearchMode(mode);
                setMessage("");
              }}
            />
          </div>

          <div className="search-step">
            <div className="search-step-heading">
              <span>02</span>

              <div>
                <h2>Add jewellery image</h2>

                <p>Upload an image or take a photo of the jewellery design.</p>
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
          >
            <span>Search Jewellery</span>

            <strong>→</strong>
          </button>

          {message && <div className="search-message">{message}</div>}
        </section>

        <section className="search-how">
          <div className="search-how-heading">
            <span>Search workflow</span>

            <h2>Simple & straightforward</h2>
          </div>

          <div className="search-how-grid">
            <div className="how-card">
              <strong>01</strong>

              <h3>Select</h3>

              <p>
                Choose whether you want to search across all jewellery or
                between a specific collection.
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
                Start the catalogue search using the selected search direction.
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

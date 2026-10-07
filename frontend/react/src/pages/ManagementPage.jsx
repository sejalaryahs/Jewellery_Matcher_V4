import { Link } from "react-router-dom";

import Header from "../components/Header";

import "../styles/catalogue.css";

function ManagementPage() {
  return (
    <div className="management-page">
      <Header />

      <main className="management-main">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="management-hero">
          <div className="management-hero-content">
            <span className="management-eyebrow">✦ JEWELMATCH MANAGEMENT</span>

            <h1>Jewellery Management</h1>

            {/* <p>
              Manage your jewellery collection, add new designs, and maintain
              existing catalogue records from one place.
            </p> */}
          </div>

          {/* <div className="management-hero-mark">
            <span>✦</span>

            <small>
              JEWEL
              <br />
              MATCH
            </small>
          </div> */}
        </section>

        {/* =================================================
            MANAGEMENT ACTIONS
        ================================================= */}

        <section className="management-actions-section">
          <div className="management-section-heading">
            <div>
              <span>COLLECTION</span>

              <h2>What would you like to do?</h2>
            </div>
          </div>

          <div className="management-action-grid">
            {/* =================================================
                ADD JEWELLERY
            ================================================= */}

            <Link
              to="/add-jewellery"
              className="management-action-card management-add-card"
            >
              <div className="management-action-top">
                <div className="management-action-icon">+</div>

                <span className="management-action-number">01</span>
              </div>

              <div className="management-action-content">
                <span className="management-action-label">NEW DESIGN</span>

                <h3>Add Jewellery</h3>

                <p>
                  Add a new jewellery design to your collection with its image,
                  name, collection, type and description.
                </p>
              </div>

              <div className="management-action-footer">
                <span>Add a new design</span>

                <strong>→</strong>
              </div>
            </Link>

            {/* =================================================
                MANAGE JEWELLERY
            ================================================= */}

            <Link
              to="/manage-jewellery"
              className="management-action-card management-manage-card"
            >
              <div className="management-action-top">
                <div className="management-action-icon">✦</div>

                <span className="management-action-number">02</span>
              </div>

              <div className="management-action-content">
                <span className="management-action-label">
                  EXISTING COLLECTION
                </span>

                <h3>Manage Jewellery</h3>

                <p>
                  View existing jewellery designs and open individual records to
                  edit or delete them when required.
                </p>
              </div>

              <div className="management-action-footer">
                <span>Manage existing designs</span>

                <strong>→</strong>
              </div>
            </Link>
          </div>
        </section>

        {/* =================================================
            WORKFLOW INFORMATION
        ================================================= */}
        {/* 
        <section className="management-workflow">
          <div className="management-workflow-icon">✦</div>

          <div className="management-workflow-content">
            <span>COLLECTION WORKFLOW</span>

            <h3>Keep your jewellery catalogue organised</h3>

            <p>
              Add new designs when they arrive and use Manage Jewellery whenever
              an existing catalogue record needs to be updated or removed.
            </p>
          </div>
        </section> */}

        {/* =================================================
            QUICK NAVIGATION
        ================================================= */}

        <section className="management-quick-links">
          <Link to="/catalogue" className="management-back-link">
            <span>←</span>

            <div>
              <small>RETURN TO </small>

              <strong>Catalogue</strong>
            </div>
          </Link>
        </section>
      </main>
    </div>
  );
}

export default ManagementPage;

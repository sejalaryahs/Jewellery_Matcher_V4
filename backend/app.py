# ============================================================
# JEWELMATCH AI - SUPABASE BACKEND
# ============================================================

import os
import traceback
from pathlib import Path

import requests
from flask import (
    Flask,
    Response,
    jsonify,
    request,
    send_from_directory,
)

from flask_cors import CORS

from .config import ALLOWED_EXTENSIONS, TOP_K

from .database.supabase import test_supabase_connection

from .services.supabase_jewellery import (
    add_jewellery as supabase_add_jewellery,
    get_all_jewellery,
    get_jewellery_by_id,
    update_jewellery as supabase_update_jewellery,
    delete_jewellery as supabase_delete_jewellery,
)

# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__, static_folder=None)

CORS(app)

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# ============================================================
# MATCH API PROXY
# ============================================================


def match_api_url(path):
    upstream_root = os.getenv("MATCH_API_UPSTREAM", "").rstrip("/")
    return f"{upstream_root}/{path.lstrip('/')}"


@app.post("/api/match")
def proxy_match_request():
    """Forward browser match uploads to the configured matching service."""

    upstream_url = match_api_url("/api/match")

    if not os.getenv("MATCH_API_UPSTREAM"):
        return (
            jsonify(
                {
                    "success": False,
                    "message": "Matching service is not configured.",
                }
            ),
            503,
        )

    try:
        upstream = requests.post(
            upstream_url,
            data=request.get_data(),
            headers={"Content-Type": request.content_type or "application/octet-stream"},
            timeout=(10, 280),
        )
    except requests.RequestException:
        app.logger.exception("Matching service request failed")
        return jsonify({"success": False, "message": "Matching service is unavailable."}), 502

    return Response(
        upstream.content,
        status=upstream.status_code,
        content_type=upstream.headers.get("Content-Type", "application/json"),
    )


def proxy_match_asset(path):
    if not os.getenv("MATCH_API_UPSTREAM"):
        return jsonify({"success": False, "message": "Matching service is not configured."}), 503

    try:
        upstream = requests.get(match_api_url(path), timeout=(10, 60))
    except requests.RequestException:
        app.logger.exception("Matching asset request failed")
        return jsonify({"success": False, "message": "Matching service is unavailable."}), 502

    return Response(
        upstream.content,
        status=upstream.status_code,
        content_type=upstream.headers.get("Content-Type", "application/octet-stream"),
    )


@app.get("/catalogue-image/<path:image_path>")
def proxy_match_catalogue_image(image_path):
    return proxy_match_asset(f"/catalogue-image/{image_path}")


@app.get("/catalogue/<path:image_path>")
def proxy_match_catalogue_file(image_path):
    return proxy_match_asset(f"/catalogue/{image_path}")


# ============================================================
# PROJECT DIRECTORIES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

BACKEND_DIR = BASE_DIR / "backend"

FRONTEND_DIST = BASE_DIR / "frontend" / "react" / "dist"


# ============================================================
# COLLECTIONS
# ============================================================

VALID_COLLECTIONS = {
    "gold": "Gold",
    "prototype": "Prototype",
}


# ============================================================
# JEWELLERY TYPES
# ============================================================

VALID_JEWELLERY_TYPES = {
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
}


# ============================================================
# NORMALIZE COLLECTION
# ============================================================


def normalize_collection(value):

    if value is None:
        return None

    value = str(value).strip().lower()

    if value == "gold":
        return "gold"

    if value in {"prototype", "prototypes"}:
        return "prototype"

    return None


# ============================================================
# CHECK ALLOWED IMAGE
# ============================================================


def allowed_file(filename):

    if not filename or "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    return extension in ALLOWED_EXTENSIONS


# ============================================================
# DEBUG ROUTES
# ============================================================


@app.get("/api/debug/routes")
def debug_routes():

    routes = []

    for rule in app.url_map.iter_rules():

        if rule.rule.startswith("/api/"):

            routes.append(
                {
                    "rule": str(rule),
                    "methods": sorted(
                        method
                        for method in rule.methods
                        if method not in {"HEAD", "OPTIONS"}
                    ),
                }
            )

    return jsonify(
        {
            "success": True,
            "application": __name__,
            "routes": sorted(
                routes,
                key=lambda item: item["rule"],
            ),
        }
    )


# ============================================================
# HEALTH
# ============================================================


@app.get("/api/health")
def health():

    try:

        connected = test_supabase_connection()

        if not connected:

            return (
                jsonify(
                    {
                        "success": False,
                        "backend": "running",
                        "supabase": False,
                        "database": "PostgreSQL",
                    }
                ),
                503,
            )

        return jsonify(
            {
                "success": True,
                "backend": "running",
                "supabase": True,
                "database": "PostgreSQL",
                "storage": "Supabase Storage",
            }
        )

    except Exception as exc:

        traceback.print_exc()

        return (
            jsonify(
                {
                    "success": False,
                    "backend": "running",
                    "supabase": False,
                    "error": str(exc),
                }
            ),
            500,
        )


# ============================================================
# JEWELLERY TYPES
# ============================================================


@app.get("/api/jewellery-types")
def get_jewellery_types():

    return jsonify(
        {
            "success": True,
            "types": sorted(VALID_JEWELLERY_TYPES),
        }
    )


# ============================================================
# CATALOGUE
# ============================================================


@app.get("/api/catalogue")
def get_catalogue():

    try:

        collection = request.args.get(
            "collection",
            "all",
        ).strip()

        search = request.args.get(
            "search",
            "",
        ).strip()

        normalized_collection = collection.lower()

        if normalized_collection != "all":

            if not normalize_collection(collection):

                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "Invalid collection.",
                        }
                    ),
                    400,
                )

        items = get_all_jewellery(
            collection=collection,
            search=search,
        )

        # Count records returned by the current query.
        gold_count = sum(
            1 for item in items if str(item.get("collection", "")).lower() == "gold"
        )

        prototype_count = sum(
            1
            for item in items
            if str(item.get("collection", "")).lower() in {"prototype", "prototypes"}
        )

        return jsonify(
            {
                "success": True,
                "items": items,
                "count": len(items),
                "total_count": len(items),
                "gold_count": gold_count,
                "prototype_count": prototype_count,
            }
        )

    except Exception as exc:

        print("Catalogue error:", repr(exc))

        traceback.print_exc()

        return (
            jsonify(
                {
                    "success": False,
                    "error": str(exc),
                }
            ),
            500,
        )


# ============================================================
# GET SINGLE JEWELLERY
# ============================================================


@app.get("/api/catalogue/<item_id>")
@app.get("/api/jewellery/<item_id>")
def get_single_jewellery(item_id):

    try:

        item = get_jewellery_by_id(item_id)

        if not item:

            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Jewellery not found.",
                    }
                ),
                404,
            )

        return jsonify(
            {
                "success": True,
                "item": item,
            }
        )

    except Exception as exc:

        print("Get jewellery error:", repr(exc))

        traceback.print_exc()

        return (
            jsonify(
                {
                    "success": False,
                    "error": str(exc),
                }
            ),
            500,
        )


# ============================================================
# ADD JEWELLERY
# ============================================================


@app.post("/api/catalogue")
@app.post("/api/jewellery/add")
def add_jewellery():

    try:

        # ----------------------------------------------------
        # FORM DATA
        # ----------------------------------------------------

        name = request.form.get(
            "name",
            "",
        ).strip()

        collection = request.form.get(
            "collection",
            "",
        ).strip()

        jewellery_type = (
            request.form.get(
                "type",
                "",
            )
            .strip()
            .upper()
        )

        description = request.form.get(
            "description",
            "",
        ).strip()

        image = request.files.get("image")

        # ----------------------------------------------------
        # VALIDATE NAME
        # ----------------------------------------------------

        if not name:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Jewellery name is required.",
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # VALIDATE COLLECTION
        # ----------------------------------------------------

        if not normalize_collection(collection):

            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Collection must be Gold or Prototype.",
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # VALIDATE TYPE
        # ----------------------------------------------------

        if jewellery_type not in VALID_JEWELLERY_TYPES:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Invalid jewellery type.",
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # VALIDATE IMAGE
        # ----------------------------------------------------

        if not image or not image.filename:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Jewellery image is required.",
                    }
                ),
                400,
            )

        if not allowed_file(image.filename):

            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Unsupported image format.",
                        "allowed_extensions": sorted(ALLOWED_EXTENSIONS),
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # SAVE TO SUPABASE
        # ----------------------------------------------------

        item = supabase_add_jewellery(
            image=image,
            name=name,
            collection=collection,
            jewellery_type=jewellery_type,
            description=description,
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Jewellery added successfully.",
                    "item": item,
                }
            ),
            201,
        )

    except Exception as exc:

        print("Add jewellery error:", repr(exc))

        traceback.print_exc()

        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unable to add jewellery.",
                    "error": str(exc),
                }
            ),
            500,
        )


# ============================================================
# UPDATE JEWELLERY
# ============================================================


@app.post("/api/catalogue/<item_id>")
@app.post("/api/jewellery/<item_id>")
def update_jewellery(item_id):

    try:

        # ----------------------------------------------------
        # FORM DATA
        # ----------------------------------------------------

        name = request.form.get("name")

        collection = request.form.get("collection")

        jewellery_type = request.form.get("type")

        description = request.form.get("description")

        image = request.files.get("image")

        # ----------------------------------------------------
        # VALIDATE COLLECTION
        # ----------------------------------------------------

        if collection:

            if not normalize_collection(collection):

                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Collection must be Gold or Prototype.",
                        }
                    ),
                    400,
                )

        # ----------------------------------------------------
        # VALIDATE TYPE
        # ----------------------------------------------------

        if jewellery_type:

            jewellery_type = jewellery_type.strip().upper()

            if jewellery_type not in VALID_JEWELLERY_TYPES:

                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Invalid jewellery type.",
                        }
                    ),
                    400,
                )

        # ----------------------------------------------------
        # VALIDATE IMAGE
        # ----------------------------------------------------

        if image and image.filename:

            if not allowed_file(image.filename):

                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Unsupported image format.",
                        }
                    ),
                    400,
                )

        # ----------------------------------------------------
        # UPDATE SUPABASE
        # ----------------------------------------------------

        item = supabase_update_jewellery(
            jewellery_id=item_id,
            name=name,
            collection=collection,
            jewellery_type=jewellery_type,
            description=description,
            image=image if image and image.filename else None,
        )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Jewellery updated successfully.",
                    "item": item,
                }
            ),
            200,
        )

    except ValueError as exc:

        return (
            jsonify(
                {
                    "success": False,
                    "message": str(exc),
                }
            ),
            404,
        )

    except Exception as exc:

        print("Update jewellery error:", repr(exc))

        traceback.print_exc()

        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unable to update jewellery.",
                    "error": str(exc),
                }
            ),
            500,
        )


# ============================================================
# DELETE JEWELLERY
# ============================================================


@app.delete("/api/catalogue/<item_id>")
@app.delete("/api/jewellery/<item_id>")
def delete_jewellery(item_id):

    try:

        result = supabase_delete_jewellery(item_id)

        return jsonify(result), 200

    except ValueError as exc:

        return (
            jsonify(
                {
                    "success": False,
                    "message": str(exc),
                }
            ),
            404,
        )

    except Exception as exc:

        print("Delete jewellery error:", repr(exc))

        traceback.print_exc()

        return (
            jsonify(
                {
                    "success": False,
                    "message": "Unable to delete jewellery.",
                    "error": str(exc),
                }
            ),
            500,
        )


# ============================================================
# REACT FRONTEND
# ============================================================


def frontend_response(path=""):

    # --------------------------------------------------------
    # API ROUTES MUST NOT GO TO REACT
    # --------------------------------------------------------

    if path.startswith("api/"):

        return (
            jsonify(
                {
                    "success": False,
                    "error": "API endpoint not found.",
                }
            ),
            404,
        )

    # --------------------------------------------------------
    # CHECK FRONTEND BUILD
    # --------------------------------------------------------

    index_file = FRONTEND_DIST / "index.html"

    if not index_file.exists():

        return (
            jsonify(
                {
                    "success": False,
                    "error": "React frontend build was not found.",
                    "frontend_dist": str(FRONTEND_DIST),
                }
            ),
            500,
        )

    # --------------------------------------------------------
    # SERVE STATIC FILES
    # --------------------------------------------------------

    if path:

        requested_file = (FRONTEND_DIST / path).resolve()

        frontend_root = FRONTEND_DIST.resolve()

        try:

            requested_file.relative_to(frontend_root)

        except ValueError:

            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Invalid frontend path.",
                    }
                ),
                400,
            )

        if requested_file.exists() and requested_file.is_file():

            return send_from_directory(
                str(FRONTEND_DIST),
                path,
            )

    # --------------------------------------------------------
    # REACT ROUTER FALLBACK
    # --------------------------------------------------------

    return send_from_directory(
        str(FRONTEND_DIST),
        "index.html",
    )


# ============================================================
# ROOT
# ============================================================


@app.get("/")
def home():

    return frontend_response("")


# ============================================================
# REACT ROUTES
# ============================================================


@app.route("/<path:path>")
def serve_frontend(path):

    return frontend_response(path)


# ============================================================
# FILE TOO LARGE
# ============================================================


@app.errorhandler(413)
def file_too_large(error):

    return (
        jsonify(
            {
                "success": False,
                "error": "File is too large. Maximum allowed size is 10 MB.",
            }
        ),
        413,
    )


# ============================================================
# NOT FOUND
# ============================================================


@app.errorhandler(404)
def not_found(error):

    return (
        jsonify(
            {
                "success": False,
                "error": "Endpoint not found.",
            }
        ),
        404,
    )


# ============================================================
# METHOD NOT ALLOWED
# ============================================================


@app.errorhandler(405)
def method_not_allowed(error):

    return (
        jsonify(
            {
                "success": False,
                "error": "Method not allowed.",
            }
        ),
        405,
    )


# ============================================================
# GENERAL ERROR
# ============================================================


@app.errorhandler(Exception)
def handle_general_error(error):

    print("Unhandled application error:", repr(error))

    traceback.print_exc()

    return (
        jsonify(
            {
                "success": False,
                "error": str(error),
            }
        ),
        500,
    )


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print("=" * 70)

    print("JEWELMATCH AI BACKEND")

    print("=" * 70)

    print("Database: Supabase PostgreSQL")

    print("Image storage: Supabase Storage")

    print("MongoDB: Disabled in this application")

    print("Top K matches:", TOP_K)

    print("Frontend directory:", FRONTEND_DIST)

    print(
        "Frontend index exists:",
        (FRONTEND_DIST / "index.html").exists(),
    )

    try:

        print(
            "Supabase connected:",
            test_supabase_connection(),
        )

    except Exception as exc:

        print(
            "Supabase connection failed:",
            repr(exc),
        )

    print("=" * 70)

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )

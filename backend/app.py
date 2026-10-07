# ============================================================
# JEWELMATCH AI - BACKEND APPLICATION
# ============================================================

from pathlib import Path
from datetime import datetime, timezone
from urllib.parse import quote
import traceback

from flask import (
    Flask,
    jsonify,
    request,
    send_from_directory,
    send_file,
)

from flask_cors import CORS
from werkzeug.utils import secure_filename

from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId

# ============================================================
# INTERNAL IMPORTS
# ============================================================

from .config import (
    ALLOWED_EXTENSIONS,
    TOP_K,
)


from .database.mongodb import (
    get_jewellery_collection,
    test_mongodb_connection,
)

# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(
    __name__,
    static_folder=None,
)

CORS(app)


# ============================================================
# UPLOAD LIMIT
# ============================================================

app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# ============================================================
# PROJECT DIRECTORIES
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

BACKEND_DIR = BASE_DIR / "backend"

DATABASE_DIR = BACKEND_DIR / "database"

CATALOGUE_DIR = BACKEND_DIR / "catalogue"

GOLD_DIR = CATALOGUE_DIR / "gold"

PROTOTYPE_DIR = CATALOGUE_DIR / "prototype"


FRONTEND_DIST = BASE_DIR / "frontend" / "react" / "dist"


# ============================================================
# COLLECTION SETTINGS
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
# CREATE CATALOGUE DIRECTORY STRUCTURE
# ============================================================

# The physical image storage always follows:
# catalogue/<collection>/<jewellery_type>/<image>
# Example: catalogue/gold/LP/J001.jpeg
#          catalogue/prototype/GP/J101.jpeg
#
# Empty type folders are created automatically for both collections
# when the backend starts. This keeps the local catalogue structure
# ready before the first upload.


def ensure_catalogue_directories():

    for collection in VALID_COLLECTIONS.keys():
        collection_directory = CATALOGUE_DIR / collection
        collection_directory.mkdir(parents=True, exist_ok=True)

        for jewellery_type in VALID_JEWELLERY_TYPES:
            (collection_directory / jewellery_type).mkdir(parents=True, exist_ok=True)


# ============================================================
# NORMALIZE COLLECTION
# ============================================================


def normalize_collection(value):

    if value is None:
        return None

    value = str(value).strip().lower()

    if value == "gold":
        return "gold"

    if value == "prototype":
        return "prototype"

    return None


# Create Gold/<Type> and Prototype/<Type> folders automatically.
ensure_catalogue_directories()


# ============================================================
# CHECK ALLOWED IMAGE
# ============================================================


def allowed_file(filename):

    if not filename:
        return False

    if "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    return extension in ALLOWED_EXTENSIONS


# ============================================================
# GET ITEM FILENAME
# ============================================================


def get_item_filename(item):

    if not item:
        return None

    filename = item.get("filename")

    if filename:
        return Path(str(filename)).name

    image = item.get("image")

    if image:
        return Path(str(image)).name

    image_path = item.get("image_path")

    if image_path:
        return Path(str(image_path)).name

    return None


# ============================================================
# GET ITEM COLLECTION
# ============================================================


def get_item_collection(item):

    if not item:
        return None

    return normalize_collection(item.get("collection"))


# ============================================================
# GET ITEM LOCAL IMAGE PATH
# ============================================================


def get_item_local_path(item):

    if not item:
        return None

    collection = get_item_collection(item)
    filename = get_item_filename(item)
    jewellery_type = str(item.get("type") or "").strip()

    if not collection or not filename:
        return None

    # New structure: catalogue/<collection>/<type>/<filename>
    if jewellery_type:
        return CATALOGUE_DIR / collection / jewellery_type / filename

    # Backward compatibility for older records.
    image_path = item.get("image_path")
    if image_path:
        path = Path(str(image_path))
        if not path.is_absolute():
            return CATALOGUE_DIR / path
        return path

    base_dir = GOLD_DIR if collection == "gold" else PROTOTYPE_DIR
    return base_dir / filename


# ============================================================
# GET GRIDFS
# ============================================================


def get_mongo_database():

    # get_jewellery_collection() is still used only to obtain the
    # existing MongoDB connection/database. The actual jewellery data
    # is stored in the Gold and Prototype collections.
    base_collection = get_jewellery_collection()
    return base_collection.database


def get_mongo_collection(collection_name):

    normalized = normalize_collection(collection_name)

    if normalized not in {"gold", "prototype"}:
        raise ValueError("MongoDB collection must be Gold or Prototype.")

    database = get_mongo_database()

    # These are the two MongoDB collections created by the user:
    # jewelmatch.gold and jewelmatch.prototype
    return database[normalized]


def get_catalogue_collections():

    database = get_mongo_database()

    return {
        "gold": database["gold"],
        "prototype": database["prototype"],
    }


def get_gridfs():

    return GridFS(get_mongo_database())


# ============================================================
# CHECK GRIDFS ID
# ============================================================


def get_gridfs_id(item):

    if not item:
        return None

    value = item.get("image_gridfs_id")

    if not value:
        return None

    try:

        if isinstance(value, ObjectId):
            return value

        return ObjectId(str(value))

    except Exception:

        return None


# ============================================================
# ADD IMAGE URL TO ITEM
# ============================================================


def add_image_url(item):

    if not item:
        return item

    item = dict(item)

    collection = get_item_collection(item)

    filename = get_item_filename(item)

    gridfs_id = get_gridfs_id(item)

    # --------------------------------------------------------
    # GRIDFS IMAGE
    # --------------------------------------------------------

    if gridfs_id:

        item["image_url"] = f"/catalogue-image/" f"stored/" f"{str(gridfs_id)}"

    # --------------------------------------------------------
    # LOCAL IMAGE FALLBACK
    # --------------------------------------------------------

    elif collection and filename:

        encoded_filename = quote(filename, safe="")

        item["image_url"] = f"/catalogue-image/" f"{collection}/" f"{encoded_filename}"

    if filename:

        item["image"] = filename
        item["filename"] = filename

    return item


# ============================================================
# SERIALIZE MONGODB ITEM
# ============================================================


def serialize_mongo_item(item):

    if not item:
        return item

    item = dict(item)

    item.pop("_id", None)

    # ObjectId cannot be returned directly by jsonify
    if item.get("image_gridfs_id"):

        item["image_gridfs_id"] = str(item["image_gridfs_id"])

    return add_image_url(item)


# ============================================================
# GET MONGODB COLLECTION
# ============================================================


def get_catalogue_collection(collection_name):

    return get_mongo_collection(collection_name)


# ============================================================
# HEALTH
# ============================================================


@app.get("/api/health")
def health():

    try:

        mongo_ok = test_mongodb_connection()

        return jsonify(
            {
                "success": True,
                "backend": "running",
                "mongodb": mongo_ok,
                "gridfs": mongo_ok,
            }
        )

    except Exception as exc:

        print("Health check error:", repr(exc))

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
# CATALOGUE
# ============================================================


@app.get("/api/catalogue")
def get_catalogue():

    try:

        collection_name = request.args.get("collection", "all").strip().lower()

        search_text = request.args.get("search", "").strip()

        # ----------------------------------------------------
        # SELECT MONGODB COLLECTIONS
        # ----------------------------------------------------

        collections = get_catalogue_collections()

        if collection_name == "all":
            selected_collections = [
                collections["gold"],
                collections["prototype"],
            ]
        else:
            selected_collections = [collections[collection_name]]

        # ----------------------------------------------------
        # BUILD QUERY
        # ----------------------------------------------------

        query = {}

        if search_text:

            query["$or"] = [
                {"id": {"$regex": search_text, "$options": "i"}},
                {"design_id": {"$regex": search_text, "$options": "i"}},
                {"name": {"$regex": search_text, "$options": "i"}},
                {"design_name": {"$regex": search_text, "$options": "i"}},
                {"type": {"$regex": search_text, "$options": "i"}},
                {"subtype": {"$regex": search_text, "$options": "i"}},
                {"description": {"$regex": search_text, "$options": "i"}},
            ]

        # ----------------------------------------------------
        # FETCH FROM GOLD / PROTOTYPE
        # ----------------------------------------------------

        items = []

        for mongo_collection in selected_collections:
            documents = mongo_collection.find(query, {"_id": 0}).sort([("id", 1)])

            items.extend(serialize_mongo_item(document) for document in documents)

        items.sort(key=lambda item: str(item.get("id") or item.get("design_id") or ""))

        # ----------------------------------------------------
        # COUNTS FROM BOTH MONGODB COLLECTIONS
        # ----------------------------------------------------

        total_count = sum(
            collection.count_documents({}) for collection in collections.values()
        )

        gold_count = collections["gold"].count_documents({})
        prototype_count = collections["prototype"].count_documents({})

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return jsonify(
            {
                "success": True,
                "items": items,
                "count": len(items),
                "total_count": total_count,
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
# GET SINGLE CATALOGUE ITEM
# ============================================================


@app.get("/api/catalogue/<item_id>")
def get_catalogue_item(item_id):

    return get_single_jewellery_item(item_id)


# ============================================================
# GET SINGLE JEWELLERY ITEM
# ============================================================


@app.get("/api/jewellery/<item_id>")
def get_jewellery_item(item_id):

    return get_single_jewellery_item(item_id)


# ============================================================
# SHARED GET SINGLE JEWELLERY
# ============================================================


def get_single_jewellery_item(item_id):

    try:

        item = None

        for mongo_collection in get_catalogue_collections().values():
            item = mongo_collection.find_one(
                {"id": item_id},
                {"_id": 0},
            )
            if item:
                break

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

        item = serialize_mongo_item(item)

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
# CATALOGUE IMAGE FROM GRIDFS
# ============================================================


@app.get("/catalogue-image/stored/<gridfs_id>")
def catalogue_image_stored(gridfs_id):

    try:

        # ----------------------------------------------------
        # VALIDATE OBJECT ID
        # ----------------------------------------------------

        try:

            object_id = ObjectId(gridfs_id)

        except Exception:

            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Invalid image ID.",
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # GET GRIDFS
        # ----------------------------------------------------

        fs = get_gridfs()

        # ----------------------------------------------------
        # CHECK FILE
        # ----------------------------------------------------

        if not fs.exists(object_id):

            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Stored image not found.",
                    }
                ),
                404,
            )

        # ----------------------------------------------------
        # GET FILE
        # ----------------------------------------------------

        grid_file = fs.get(object_id)

        # ----------------------------------------------------
        # RETURN FILE
        # ----------------------------------------------------

        response = send_file(
            grid_file,
            mimetype=(
                grid_file.content_type
                if getattr(grid_file, "content_type", None)
                else None
            ),
            download_name=(
                grid_file.filename
                if getattr(grid_file, "filename", None)
                else "jewellery-image"
            ),
        )

        response.headers["Cache-Control"] = "public, max-age=31536000"

        return response

    except Exception as exc:

        print("GridFS image error:", repr(exc))

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
# CATALOGUE IMAGE - LOCAL FALLBACK
# ============================================================


@app.get("/catalogue-image/<collection>/<path:filename>")
def catalogue_image(collection, filename):
    try:
        collection = collection.strip().lower()
        if collection not in {"gold", "prototype"}:
            return jsonify({"success": False, "error": "Invalid collection."}), 400

        collection_directory = (CATALOGUE_DIR / collection).resolve()
        requested_path = (collection_directory / filename).resolve()

        try:
            requested_path.relative_to(collection_directory)
        except ValueError:
            return jsonify({"success": False, "error": "Invalid image path."}), 400

        if not requested_path.exists() or not requested_path.is_file():
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Catalogue image not found.",
                        "filename": filename,
                        "collection": collection,
                    }
                ),
                404,
            )

        relative_path = requested_path.relative_to(collection_directory)
        response = send_from_directory(str(collection_directory), str(relative_path))
        response.headers["Cache-Control"] = "public, max-age=31536000"
        return response

    except Exception as exc:
        print("Catalogue image error:", repr(exc))
        traceback.print_exc()
        return jsonify({"success": False, "error": str(exc)}), 500


# ============================================================
# GENERATE NEXT JEWELLERY ID
# ============================================================


def generate_next_jewellery_id():

    try:

        highest_number = 0

        for mongo_collection in get_catalogue_collections().values():
            documents = mongo_collection.find(
                {
                    "id": {
                        "$regex": r"^J\d+$",
                        "$options": "i",
                    }
                },
                {"_id": 0, "id": 1},
            )

            for document in documents:
                item_id = str(document.get("id", "")).strip().upper()

                if not item_id.startswith("J"):
                    continue

                number_part = item_id[1:]

                if number_part.isdigit():
                    highest_number = max(
                        highest_number,
                        int(number_part),
                    )

        return f"J{highest_number + 1:03d}"

    except Exception as exc:
        print("Generate ID error:", repr(exc))
        raise


# ============================================================
# SAVE IMAGE TO GRIDFS
# ============================================================


def save_image_to_gridfs(image_file, filename, collection):

    try:

        fs = get_gridfs()

        # ----------------------------------------------------
        # RESET FILE POINTER
        # ----------------------------------------------------

        image_file.stream.seek(0)

        # ----------------------------------------------------
        # READ IMAGE
        # ----------------------------------------------------

        image_bytes = image_file.read()

        if not image_bytes:

            raise ValueError("Uploaded image is empty.")

        # ----------------------------------------------------
        # CONTENT TYPE
        # ----------------------------------------------------

        content_type = image_file.content_type or "application/octet-stream"

        # ----------------------------------------------------
        # STORE IN GRIDFS
        # ----------------------------------------------------

        gridfs_id = fs.put(
            image_bytes,
            filename=filename,
            content_type=content_type,
            collection=collection,
            uploaded_at=datetime.now(timezone.utc).isoformat(),
        )

        print("Image stored in GridFS:", gridfs_id)

        return gridfs_id

    except Exception as exc:

        print("GridFS upload error:", repr(exc))

        raise


# ============================================================
# ADD JEWELLERY
# ============================================================


@app.post("/api/catalogue")
def add_jewellery():

    target_path = None
    gridfs_id = None

    try:

        # ----------------------------------------------------
        # MONGODB
        # ----------------------------------------------------

        # MongoDB collection is selected after reading the user's
        # Gold / Prototype choice from the form.
        mongo_collection = None

        # ----------------------------------------------------
        # FORM DATA
        # ----------------------------------------------------

        name = request.form.get("name", "").strip()

        collection_value = request.form.get("collection", "").strip()

        jewellery_type = request.form.get("type", "").strip()

        description = request.form.get("description", "").strip()

        # ----------------------------------------------------
        # VALIDATE NAME
        # ----------------------------------------------------

        if not name:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Please enter the jewellery name."),
                        "error": ("Jewellery name is required."),
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # VALIDATE COLLECTION
        # ----------------------------------------------------

        collection = normalize_collection(collection_value)

        if not collection:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Please select a collection."),
                        "error": ("Collection must be Gold or Prototype."),
                    }
                ),
                400,
            )

        # Store the document in the user's MongoDB collection:
        # jewelmatch.gold OR jewelmatch.prototype.
        mongo_collection = get_catalogue_collection(collection)

        # ----------------------------------------------------
        # VALIDATE TYPE
        # ----------------------------------------------------

        if not jewellery_type:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Please select a jewellery type."),
                        "error": ("Jewellery type is required."),
                    }
                ),
                400,
            )

        # Keep the folder name consistent with the approved
        # jewellery-type list used by the frontend.
        jewellery_type = jewellery_type.upper()

        if jewellery_type not in VALID_JEWELLERY_TYPES:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Please select a valid jewellery type."),
                        "error": ("Invalid jewellery type."),
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # VALIDATE IMAGE
        # ----------------------------------------------------

        image_file = request.files.get("image")

        if not image_file:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Please upload a jewellery image."),
                        "error": ("Jewellery image is required."),
                    }
                ),
                400,
            )

        if not image_file.filename:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Invalid image file."),
                        "error": ("Invalid image filename."),
                    }
                ),
                400,
            )

        if not allowed_file(image_file.filename):

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Unsupported image format."),
                        "error": ("Use JPG, JPEG, PNG, WEBP or BMP."),
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # GENERATE ID
        # ----------------------------------------------------

        jewellery_id = generate_next_jewellery_id()

        print("Generated jewellery ID:", jewellery_id)

        # ----------------------------------------------------
        # SECURE FILENAME
        # ----------------------------------------------------

        original_filename = secure_filename(image_file.filename)

        if not original_filename:

            return (
                jsonify(
                    {
                        "success": False,
                        "message": ("Invalid image filename."),
                        "error": ("Invalid image filename."),
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # SELECT LOCAL DIRECTORY
        # ----------------------------------------------------

        # New structure: catalogue/<collection>/<type>/image
        target_directory = CATALOGUE_DIR / collection / jewellery_type

        target_directory.mkdir(parents=True, exist_ok=True)

        # ----------------------------------------------------
        # AVOID OVERWRITING LOCAL IMAGE
        # ----------------------------------------------------

        target_path = target_directory / original_filename

        if target_path.exists():

            stem = target_path.stem
            suffix = target_path.suffix

            counter = 1

            while target_path.exists():

                new_filename = f"{stem}_{counter}{suffix}"

                target_path = target_directory / new_filename

                counter += 1

            original_filename = target_path.name

        # ----------------------------------------------------
        # READ IMAGE ONCE
        # ----------------------------------------------------

        image_file.stream.seek(0)

        image_bytes = image_file.read()

        if not image_bytes:

            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Uploaded image is empty.",
                    }
                ),
                400,
            )

        # ----------------------------------------------------
        # SAVE LOCAL IMAGE
        # ----------------------------------------------------

        with open(target_path, "wb") as output_file:

            output_file.write(image_bytes)

        print("Image saved locally:", target_path)

        # ----------------------------------------------------
        # SAVE IMAGE TO GRIDFS
        # ----------------------------------------------------

        fs = get_gridfs()

        content_type = image_file.content_type or "application/octet-stream"

        # Store the GridFS filename using the same hierarchy as the
        # local catalogue folder structure. GridFS does not create real
        # folders, but this path is stored in fs.files.filename and lets
        # MongoDB preserve the collection -> type -> image structure.
        gridfs_relative_path = f"{collection}/{jewellery_type}/{original_filename}"

        gridfs_id = fs.put(
            image_bytes,
            filename=gridfs_relative_path,
            content_type=content_type,
            collection=VALID_COLLECTIONS[collection],
            jewellery_type=jewellery_type,
            jewellery_id=jewellery_id,
            image_path=gridfs_relative_path,
            uploaded_at=datetime.now(timezone.utc).isoformat(),
        )

        print("Image stored permanently in GridFS:", gridfs_id)

        # ----------------------------------------------------
        # CREATE MONGODB DOCUMENT
        # ----------------------------------------------------

        new_item = {
            "id": jewellery_id,
            "name": name,
            "collection": VALID_COLLECTIONS[collection],
            "type": jewellery_type,
            "description": description,
            "image": original_filename,
            "filename": original_filename,
            # Store a portable relative path in MongoDB.
            # Example: gold/LP/J001.jpeg
            "image_path": str(target_path.relative_to(CATALOGUE_DIR)).replace(
                "\\", "/"
            ),
            # IMPORTANT:
            # Permanent image reference
            "image_gridfs_id": gridfs_id,
        }

        # ----------------------------------------------------
        # INSERT
        # ----------------------------------------------------

        result = mongo_collection.insert_one(new_item)

        print("MongoDB inserted:", result.inserted_id)

        new_item.pop("_id", None)

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        response_item = serialize_mongo_item(new_item)

        return (
            jsonify(
                {
                    "success": True,
                    "message": (
                        "Jewellery added successfully. "
                        "Image stored in the collection/type folder and MongoDB."
                    ),
                    "item": response_item,
                }
            ),
            201,
        )

    except Exception as exc:

        print("Add jewellery error:", repr(exc))

        traceback.print_exc()

        # ----------------------------------------------------
        # CLEANUP LOCAL FILE
        # ----------------------------------------------------

        if target_path:

            try:

                if target_path.exists():

                    target_path.unlink()

            except Exception:

                pass

        # ----------------------------------------------------
        # CLEANUP GRIDFS FILE
        # ----------------------------------------------------

        if gridfs_id:

            try:

                fs = get_gridfs()

                fs.delete(gridfs_id)

            except Exception:

                pass

        return (
            jsonify(
                {
                    "success": False,
                    "message": ("Unable to add jewellery."),
                    "error": str(exc),
                }
            ),
            500,
        )


# ============================================================
# ADD JEWELLERY COMPATIBILITY ROUTE
# ============================================================


@app.post("/api/jewellery/add")
def add_jewellery_compatibility():

    return add_jewellery()


# ============================================================
# UPDATE JEWELLERY
# ============================================================


@app.post("/api/jewellery/<item_id>")
def update_jewellery(item_id):
    """
    Update an existing jewellery item in either the Gold or Prototype
    MongoDB collection.

    The local image remains under:
        catalogue/<collection>/<type>/<filename>

    If a new image is uploaded, the old local image and old GridFS file
    are removed after the new image has been successfully stored.
    """
    old_local_path = None
    new_local_path = None
    old_gridfs_id = None
    new_gridfs_id = None

    try:
        # --------------------------------------------------------
        # FIND ITEM IN GOLD OR PROTOTYPE
        # --------------------------------------------------------
        mongo_collection = None
        item = None

        for candidate_collection in get_catalogue_collections().values():
            candidate = candidate_collection.find_one({"id": item_id})
            if candidate:
                mongo_collection = candidate_collection
                item = candidate
                break

        if not item:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Jewellery not found.",
                        "error": "Jewellery not found.",
                    }
                ),
                404,
            )

        old_collection = get_item_collection(item)
        old_local_path = get_item_local_path(item)
        old_gridfs_id = get_gridfs_id(item)

        # --------------------------------------------------------
        # FORM DATA
        # --------------------------------------------------------
        name = request.form.get("name", item.get("name", "")).strip()
        collection_value = request.form.get(
            "collection", item.get("collection", "")
        ).strip()
        jewellery_type = request.form.get("type", item.get("type", "")).strip().upper()
        description = request.form.get(
            "description", item.get("description", "")
        ).strip()

        # --------------------------------------------------------
        # VALIDATE
        # --------------------------------------------------------
        if not name:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Please enter the jewellery name.",
                        "error": "Jewellery name is required.",
                    }
                ),
                400,
            )

        collection = normalize_collection(collection_value)
        if not collection:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Please select a valid collection.",
                        "error": "Collection must be Gold or Prototype.",
                    }
                ),
                400,
            )

        if not jewellery_type:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Please select a jewellery type.",
                        "error": "Jewellery type is required.",
                    }
                ),
                400,
            )

        if jewellery_type not in VALID_JEWELLERY_TYPES:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Please select a valid jewellery type.",
                        "error": "Invalid jewellery type.",
                    }
                ),
                400,
            )

        image_file = request.files.get("image")

        if image_file and image_file.filename:
            if not allowed_file(image_file.filename):
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Unsupported image format.",
                            "error": "Use JPG, JPEG, PNG, WEBP or BMP.",
                        }
                    ),
                    400,
                )

        # --------------------------------------------------------
        # TARGET MONGODB COLLECTION
        # --------------------------------------------------------
        target_mongo_collection = get_catalogue_collection(collection)

        # --------------------------------------------------------
        # PREPARE UPDATED IMAGE
        # --------------------------------------------------------
        image_changed = bool(image_file and image_file.filename)

        if image_changed:
            original_filename = secure_filename(image_file.filename)

            if not original_filename:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Invalid image filename.",
                            "error": "Invalid image filename.",
                        }
                    ),
                    400,
                )

            target_directory = CATALOGUE_DIR / collection / jewellery_type
            target_directory.mkdir(parents=True, exist_ok=True)

            new_local_path = target_directory / original_filename

            # Do not overwrite an existing file belonging to another item.
            existing_item = target_mongo_collection.find_one(
                {
                    "image": original_filename,
                    "id": {"$ne": item_id},
                }
            )

            if existing_item:
                stem = new_local_path.stem
                suffix = new_local_path.suffix
                counter = 1

                while new_local_path.exists():
                    new_local_path = target_directory / f"{stem}_{counter}{suffix}"
                    counter += 1

                original_filename = new_local_path.name

            image_file.stream.seek(0)
            image_bytes = image_file.read()

            if not image_bytes:
                return (
                    jsonify(
                        {
                            "success": False,
                            "message": "Uploaded image is empty.",
                            "error": "Uploaded image is empty.",
                        }
                    ),
                    400,
                )

            # Save local image.
            with open(new_local_path, "wb") as output_file:
                output_file.write(image_bytes)

            # Save same image to GridFS using the same virtual path.
            gridfs_relative_path = f"{collection}/{jewellery_type}/{original_filename}"

            fs = get_gridfs()

            new_gridfs_id = fs.put(
                image_bytes,
                filename=gridfs_relative_path,
                content_type=(image_file.content_type or "application/octet-stream"),
                collection=VALID_COLLECTIONS[collection],
                jewellery_type=jewellery_type,
                jewellery_id=item_id,
                image_path=gridfs_relative_path,
                uploaded_at=datetime.now(timezone.utc).isoformat(),
            )

        else:
            original_filename = get_item_filename(item)

        # --------------------------------------------------------
        # BUILD UPDATED DOCUMENT
        # --------------------------------------------------------
        update_data = {
            "name": name,
            "collection": VALID_COLLECTIONS[collection],
            "type": jewellery_type,
            "description": description,
        }

        if image_changed:
            update_data.update(
                {
                    "image": original_filename,
                    "filename": original_filename,
                    "image_path": (
                        f"{collection}/{jewellery_type}/{original_filename}"
                    ),
                    "image_gridfs_id": new_gridfs_id,
                }
            )

        # --------------------------------------------------------
        # MOVE DOCUMENT BETWEEN GOLD / PROTOTYPE IF NEEDED
        # --------------------------------------------------------
        if old_collection != collection:
            update_data["collection"] = VALID_COLLECTIONS[collection]

            target_mongo_collection.replace_one(
                {"id": item_id},
                {
                    **item,
                    **update_data,
                },
                upsert=True,
            )

            if target_mongo_collection.name != mongo_collection.name:
                mongo_collection.delete_one({"id": item_id})
        else:
            mongo_collection.update_one(
                {"id": item_id},
                {"$set": update_data},
            )

        # --------------------------------------------------------
        # DELETE OLD IMAGE ONLY AFTER DB UPDATE SUCCEEDS
        # --------------------------------------------------------
        if image_changed:
            if old_gridfs_id and (
                not new_gridfs_id or str(old_gridfs_id) != str(new_gridfs_id)
            ):
                try:
                    fs = get_gridfs()
                    if fs.exists(old_gridfs_id):
                        fs.delete(old_gridfs_id)
                except Exception as grid_exc:
                    print("Old GridFS delete warning:", repr(grid_exc))

            if old_local_path and old_local_path.exists():
                try:
                    # Avoid deleting the new image if paths happen to match.
                    if (
                        new_local_path is None
                        or old_local_path.resolve() != new_local_path.resolve()
                    ):
                        old_local_path.unlink()
                except Exception as image_exc:
                    print("Old local image delete warning:", repr(image_exc))

        # --------------------------------------------------------
        # FETCH UPDATED ITEM
        # --------------------------------------------------------
        updated_item = target_mongo_collection.find_one(
            {"id": item_id},
            {"_id": 0},
        )

        if not updated_item:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "Jewellery was updated but could not be retrieved.",
                        "error": "Updated jewellery record not found.",
                    }
                ),
                500,
            )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Jewellery updated successfully.",
                    "item": serialize_mongo_item(updated_item),
                }
            ),
            200,
        )

    except Exception as exc:
        print("Update jewellery error:", repr(exc))
        traceback.print_exc()

        # Remove newly-created files if the update failed.
        if new_local_path:
            try:
                if new_local_path.exists():
                    new_local_path.unlink()
            except Exception:
                pass

        if new_gridfs_id:
            try:
                fs = get_gridfs()
                if fs.exists(new_gridfs_id):
                    fs.delete(new_gridfs_id)
            except Exception:
                pass

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
# UPDATE CATALOGUE ITEM COMPATIBILITY
# ============================================================


@app.post("/api/catalogue/<item_id>")
def update_catalogue_item(item_id):
    return update_jewellery(item_id)


# ============================================================
# DELETE CATALOGUE ITEM
# ============================================================


@app.delete("/api/catalogue/<item_id>")
def delete_catalogue_item(item_id):

    return delete_jewellery_item(item_id)


# ============================================================
# DELETE JEWELLERY COMPATIBILITY
# ============================================================


@app.delete("/api/jewellery/<item_id>")
def delete_jewellery_compatibility(item_id):

    return delete_jewellery_item(item_id)


# ============================================================
# SHARED DELETE FUNCTION
# ============================================================


def delete_jewellery_item(item_id):

    try:

        # ----------------------------------------------------
        # FIND ITEM IN GOLD OR PROTOTYPE COLLECTION
        # ----------------------------------------------------

        mongo_collection = None
        item = None

        for candidate_collection in get_catalogue_collections().values():
            candidate = candidate_collection.find_one({"id": item_id})
            if candidate:
                mongo_collection = candidate_collection
                item = candidate
                break

        if not item:

            return (
                jsonify(
                    {
                        "success": False,
                        "error": ("Jewellery not found."),
                    }
                ),
                404,
            )

        # ----------------------------------------------------
        # GET LOCAL IMAGE
        # ----------------------------------------------------

        collection = get_item_collection(item)

        filename = get_item_filename(item)

        # ----------------------------------------------------
        # DELETE GRIDFS IMAGE
        # ----------------------------------------------------

        gridfs_id = get_gridfs_id(item)

        if gridfs_id:

            try:

                fs = get_gridfs()

                if fs.exists(gridfs_id):

                    fs.delete(gridfs_id)

                    print("Deleted GridFS image:", gridfs_id)

            except Exception as grid_exc:

                print("GridFS delete warning:", repr(grid_exc))

        # ----------------------------------------------------
        # DELETE LOCAL IMAGE
        # ----------------------------------------------------

        if collection and filename:

            image_path = get_item_local_path(item)

            if image_path and image_path.exists():

                try:

                    image_path.unlink()

                    print("Deleted local image:", image_path)

                except Exception as image_exc:

                    print("Image delete warning:", repr(image_exc))

        # ----------------------------------------------------
        # DELETE MONGODB RECORD
        # ----------------------------------------------------

        result = mongo_collection.delete_one({"id": item_id})

        if result.deleted_count == 0:

            return (
                jsonify(
                    {
                        "success": False,
                        "error": ("Jewellery could not be deleted."),
                    }
                ),
                500,
            )

        return (
            jsonify(
                {
                    "success": True,
                    "message": ("Jewellery deleted successfully."),
                    "id": item_id,
                }
            ),
            200,
        )

    except Exception as exc:

        print("Delete jewellery error:", repr(exc))

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
                    "error": ("API endpoint not found."),
                }
            ),
            404,
        )

    # --------------------------------------------------------
    # CATALOGUE IMAGE ROUTES MUST NOT GO TO REACT
    # --------------------------------------------------------

    if path.startswith("catalogue-image/"):

        return (
            jsonify(
                {
                    "success": False,
                    "error": ("Catalogue image endpoint not found."),
                }
            ),
            404,
        )

    # --------------------------------------------------------
    # CHECK FRONTEND
    # --------------------------------------------------------

    index_file = FRONTEND_DIST / "index.html"

    if not index_file.exists():

        return (
            jsonify(
                {
                    "success": False,
                    "error": ("React frontend build was not found."),
                    "frontend_dist": str(FRONTEND_DIST),
                }
            ),
            500,
        )

    # --------------------------------------------------------
    # SERVE STATIC FILE
    # --------------------------------------------------------

    if path:

        requested_file = FRONTEND_DIST / path

        try:

            requested_file = requested_file.resolve()

            frontend_root = FRONTEND_DIST.resolve()

            requested_file.relative_to(frontend_root)

        except ValueError:

            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Invalid path.",
                    }
                ),
                400,
            )

        if requested_file.exists() and requested_file.is_file():

            return send_from_directory(str(FRONTEND_DIST), path)

    # --------------------------------------------------------
    # REACT SPA FALLBACK
    # --------------------------------------------------------

    return send_from_directory(str(FRONTEND_DIST), "index.html")


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
                "error": ("File is too large. " "Maximum allowed size is 10 MB."),
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
                "error": ("Endpoint not found."),
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
                "error": ("Method not allowed."),
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

    # Make sure the complete collection/type directory tree exists
    # whenever the backend starts.
    ensure_catalogue_directories()

    print("Gold catalogue directory:")

    print(GOLD_DIR)

    print("Prototype catalogue directory:")

    print(PROTOTYPE_DIR)

    print("MongoDB connected:", test_mongodb_connection())

    print("Top K matches:", TOP_K)

    print("Frontend directory:", FRONTEND_DIST)

    print("Frontend index exists:", (FRONTEND_DIST / "index.html").exists())

    print("GridFS enabled: True")

    print("=" * 70)

    # --------------------------------------------------------
    # START FLASK
    # --------------------------------------------------------

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )

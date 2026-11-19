# ============================================================
# JEWELMATCH AI - SUPABASE JEWELLERY SERVICE
# ============================================================

import uuid
from datetime import datetime, timezone
from pathlib import Path

from werkzeug.utils import secure_filename

from ..database.supabase import (
    supabase,
    get_storage_bucket,
)

# ============================================================
# CONFIGURATION
# ============================================================

TABLE_NAME = "jewellery"

BUCKET_NAME = get_storage_bucket()


# ============================================================
# COLLECTION NORMALIZATION
# ============================================================


def normalize_collection(value):

    if not value:

        return None

    value = str(value).strip().lower()

    if value == "gold":

        return "Gold"

    if value in {"prototype", "prototypes"}:

        return "Prototype"

    return None


# ============================================================
# CURRENT UTC TIME
# ============================================================


def current_timestamp():

    return datetime.now(timezone.utc).isoformat()


# ============================================================
# STORAGE PATH
# ============================================================


def generate_storage_path(
    collection,
    jewellery_type,
    filename,
):

    collection_name = normalize_collection(collection)

    if not collection_name:

        raise ValueError("Invalid jewellery collection.")

    safe_type = secure_filename(str(jewellery_type).strip().upper())

    if not safe_type:

        safe_type = "OTHERS"

    extension = Path(filename).suffix.lower()

    if not extension:

        extension = ".jpg"

    unique_name = f"{uuid.uuid4().hex}{extension}"

    return f"{collection_name.lower()}/" f"{safe_type}/" f"{unique_name}"


# ============================================================
# GET PUBLIC IMAGE URL
# ============================================================


def get_public_image_url(image_path):

    if not image_path:

        return None

    result = supabase.storage.from_(BUCKET_NAME).get_public_url(image_path)

    # Current Supabase Python client
    # generally returns a public URL string.

    if isinstance(result, str):

        return result

    # Compatibility with clients returning dictionaries.

    if isinstance(result, dict):

        data = result.get("data") or {}

        return (
            result.get("publicUrl")
            or result.get("publicURL")
            or data.get("publicUrl")
            or data.get("publicURL")
        )

    return str(result)


# ============================================================
# UPLOAD IMAGE
# ============================================================


def upload_jewellery_image(
    image,
    collection,
    jewellery_type,
):

    if not image or not image.filename:

        raise ValueError("Jewellery image is required.")

    storage_path = generate_storage_path(
        collection=collection,
        jewellery_type=jewellery_type,
        filename=image.filename,
    )

    image_bytes = image.read()

    if not image_bytes:

        raise ValueError("Uploaded image is empty.")

    content_type = image.mimetype or "application/octet-stream"

    # --------------------------------------------------------
    # UPLOAD TO SUPABASE STORAGE
    # --------------------------------------------------------

    supabase.storage.from_(BUCKET_NAME).upload(
        storage_path,
        image_bytes,
        file_options={
            "content-type": content_type,
            "upsert": "false",
        },
    )

    # --------------------------------------------------------
    # PUBLIC IMAGE URL
    # --------------------------------------------------------

    image_url = get_public_image_url(storage_path)

    return {
        "image_path": storage_path,
        "image_url": image_url,
    }


# ============================================================
# DELETE STORAGE IMAGE
# ============================================================


def delete_storage_image(image_path):

    if not image_path:

        return

    supabase.storage.from_(BUCKET_NAME).remove([image_path])


# ============================================================
# FORMAT JEWELLERY RECORD
# ============================================================


def format_jewellery(item):

    if not item:

        return None

    return {
        # ----------------------------------------------------
        # INTERNAL DATABASE UUID
        # ----------------------------------------------------
        "id": str(item.get("id", "")),
        # ----------------------------------------------------
        # HUMAN-READABLE JEWELLERY ID
        # ----------------------------------------------------
        "design_code": item.get("design_code") or "",
        # ----------------------------------------------------
        # JEWELLERY DETAILS
        # ----------------------------------------------------
        "name": item.get("name", ""),
        "collection": item.get("collection", ""),
        "type": item.get("type", ""),
        "description": item.get("description", ""),
        # ----------------------------------------------------
        # IMAGE
        # ----------------------------------------------------
        "image_path": item.get("image_path"),
        "image_url": (
            item.get("image_url") or get_public_image_url(item.get("image_path"))
        ),
        # ----------------------------------------------------
        # TIMESTAMPS
        # ----------------------------------------------------
        "created_at": item.get("created_at"),
        "updated_at": item.get("updated_at"),
    }


# ============================================================
# GET ALL JEWELLERY
# ============================================================


def get_all_jewellery(
    collection="all",
    search="",
):

    # --------------------------------------------------------
    # FETCH DATABASE RECORDS
    # --------------------------------------------------------

    query = supabase.table(TABLE_NAME).select("*")

    normalized_collection = normalize_collection(collection)

    if str(collection).strip().lower() != "all":

        if not normalized_collection:

            raise ValueError("Invalid jewellery collection.")

        query = query.eq(
            "collection",
            normalized_collection,
        )

    response = query.execute()

    items = response.data or []

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search:

        search_text = str(search).strip().lower()

        items = [
            item
            for item in items
            if (search_text in str(item.get("name", "")).lower())
            or (search_text in str(item.get("type", "")).lower())
            or (search_text in str(item.get("description", "")).lower())
            or (search_text in str(item.get("design_code", "")).lower())
        ]

    # --------------------------------------------------------
    # LATEST FIRST
    # --------------------------------------------------------

    items.sort(
        key=lambda item: str(item.get("created_at", "")),
        reverse=True,
    )

    # --------------------------------------------------------
    # FORMAT RESPONSE
    # --------------------------------------------------------

    return [format_jewellery(item) for item in items]


# ============================================================
# GET SINGLE JEWELLERY
# ============================================================


def get_jewellery_by_id(jewellery_id):

    if not jewellery_id:

        return None

    response = (
        supabase.table(TABLE_NAME)
        .select("*")
        .eq("id", str(jewellery_id))
        .limit(1)
        .execute()
    )

    items = response.data or []

    if not items:

        return None

    return format_jewellery(items[0])


# ============================================================
# GENERATE INTERNAL JEWELLERY UUID
# ============================================================


def generate_jewellery_id():

    # Internal PostgreSQL UUID.
    #
    # Human-readable design_code such as G01 or P01
    # is generated automatically by the PostgreSQL trigger.
    #
    # Do not generate design_code here.

    return str(uuid.uuid4())


# ============================================================
# ADD JEWELLERY
# ============================================================


def add_jewellery(
    image,
    name,
    collection,
    jewellery_type,
    description="",
):

    # --------------------------------------------------------
    # VALIDATE COLLECTION
    # --------------------------------------------------------

    normalized_collection = normalize_collection(collection)

    if not normalized_collection:

        raise ValueError("Invalid jewellery collection.")

    # --------------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------------

    if not name or not name.strip():

        raise ValueError("Jewellery name is required.")

    # --------------------------------------------------------
    # VALIDATE TYPE
    # --------------------------------------------------------

    if not jewellery_type:

        raise ValueError("Jewellery type is required.")

    # --------------------------------------------------------
    # INTERNAL UUID
    # --------------------------------------------------------

    jewellery_id = generate_jewellery_id()

    # --------------------------------------------------------
    # UPLOAD IMAGE
    # --------------------------------------------------------

    image_data = upload_jewellery_image(
        image=image,
        collection=normalized_collection,
        jewellery_type=jewellery_type,
    )

    # --------------------------------------------------------
    # DATABASE PAYLOAD
    # --------------------------------------------------------

    timestamp = current_timestamp()

    payload = {
        # Internal UUID
        "id": jewellery_id,
        # PostgreSQL trigger generates design_code.
        # Do not include design_code in this payload.
        "name": name.strip(),
        "collection": normalized_collection,
        "type": jewellery_type.strip().upper(),
        "description": (description.strip() if description else ""),
        "image_path": image_data["image_path"],
        "image_url": image_data["image_url"],
        "created_at": timestamp,
        "updated_at": timestamp,
    }

    # --------------------------------------------------------
    # INSERT DATABASE RECORD
    # --------------------------------------------------------

    try:

        response = supabase.table(TABLE_NAME).insert(payload).execute()

        items = response.data or []

        if not items:

            raise RuntimeError("Supabase did not return the inserted record.")

        # The PostgreSQL trigger generates design_code.
        # Supabase returns it with the inserted record.

        return format_jewellery(items[0])

    except Exception:

        # ----------------------------------------------------
        # REMOVE IMAGE IF DATABASE INSERT FAILS
        # ----------------------------------------------------

        try:

            delete_storage_image(image_data["image_path"])

        except Exception as cleanup_error:

            print(
                "Image cleanup failed:",
                repr(cleanup_error),
            )

        raise


# ============================================================
# UPDATE JEWELLERY
# ============================================================


def update_jewellery(
    jewellery_id,
    name=None,
    collection=None,
    jewellery_type=None,
    description=None,
    image=None,
):

    # --------------------------------------------------------
    # GET EXISTING RECORD
    # --------------------------------------------------------

    existing_item = get_jewellery_by_id(jewellery_id)

    if not existing_item:

        raise ValueError("Jewellery not found.")

    old_collection = existing_item.get("collection")

    old_type = existing_item.get("type")

    old_image_path = existing_item.get("image_path")

    # --------------------------------------------------------
    # COLLECTION
    # --------------------------------------------------------

    new_collection = normalize_collection(collection) if collection else old_collection

    if not new_collection:

        raise ValueError("Invalid jewellery collection.")

    # --------------------------------------------------------
    # TYPE
    # --------------------------------------------------------

    new_type = jewellery_type.strip().upper() if jewellery_type else old_type

    # --------------------------------------------------------
    # NAME
    # --------------------------------------------------------

    if name is not None and not name.strip():

        raise ValueError("Jewellery name cannot be empty.")

    # --------------------------------------------------------
    # UPDATE PAYLOAD
    # --------------------------------------------------------

    payload = {
        "collection": new_collection,
        "type": new_type,
        "updated_at": current_timestamp(),
    }

    if name is not None:

        payload["name"] = name.strip()

    if description is not None:

        payload["description"] = description.strip()

    uploaded_image_path = None

    # --------------------------------------------------------
    # REPLACEMENT IMAGE
    # --------------------------------------------------------

    if image and image.filename:

        image_data = upload_jewellery_image(
            image=image,
            collection=new_collection,
            jewellery_type=new_type,
        )

        uploaded_image_path = image_data["image_path"]

        payload["image_path"] = image_data["image_path"]

        payload["image_url"] = image_data["image_url"]

    # --------------------------------------------------------
    # UPDATE DATABASE
    # --------------------------------------------------------

    try:

        response = (
            supabase.table(TABLE_NAME)
            .update(payload)
            .eq("id", str(jewellery_id))
            .execute()
        )

        items = response.data or []

        if not items:

            raise RuntimeError("Supabase did not return the updated record.")

        updated_item = format_jewellery(items[0])

        # ----------------------------------------------------
        # DELETE OLD IMAGE
        # ----------------------------------------------------

        if (
            uploaded_image_path
            and old_image_path
            and old_image_path != uploaded_image_path
        ):

            try:

                delete_storage_image(old_image_path)

            except Exception as cleanup_error:

                print(
                    "Old image cleanup failed:",
                    repr(cleanup_error),
                )

        return updated_item

    except Exception:

        # ----------------------------------------------------
        # CLEAN UP NEW IMAGE IF UPDATE FAILS
        # ----------------------------------------------------

        if uploaded_image_path:

            try:

                delete_storage_image(uploaded_image_path)

            except Exception:

                pass

        raise


# ============================================================
# DELETE JEWELLERY
# ============================================================


def delete_jewellery(jewellery_id):

    # --------------------------------------------------------
    # GET EXISTING RECORD
    # --------------------------------------------------------

    existing_item = get_jewellery_by_id(jewellery_id)

    if not existing_item:

        raise ValueError("Jewellery not found.")

    image_path = existing_item.get("image_path")

    # --------------------------------------------------------
    # DELETE DATABASE RECORD
    # --------------------------------------------------------

    response = supabase.table(TABLE_NAME).delete().eq("id", str(jewellery_id)).execute()

    deleted_items = response.data or []

    if not deleted_items:

        raise RuntimeError("Unable to delete jewellery record.")

    # --------------------------------------------------------
    # DELETE STORAGE IMAGE
    # --------------------------------------------------------

    if image_path:

        try:

            delete_storage_image(image_path)

        except Exception as cleanup_error:

            print(
                "Storage image cleanup failed:",
                repr(cleanup_error),
            )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "success": True,
        "message": "Jewellery deleted successfully.",
        "id": str(jewellery_id),
        "design_code": existing_item.get(
            "design_code",
            "",
        ),
    }

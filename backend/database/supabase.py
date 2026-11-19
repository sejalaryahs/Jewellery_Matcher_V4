import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

# Project root:
# E:\sejal\Jewellery_Matcher_V3
PROJECT_ROOT = Path(__file__).resolve().parents[2]

# Load root .env
ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


SUPABASE_URL = os.getenv("SUPABASE_URL")

SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY")

SUPABASE_STORAGE_BUCKET = os.getenv(
    "SUPABASE_STORAGE_BUCKET",
    "jewellery-images",
)


def get_supabase_client() -> Client:
    """
    Create and return the Supabase client.
    """

    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is missing from root .env")

    if not SUPABASE_SECRET_KEY:
        raise RuntimeError("SUPABASE_SECRET_KEY is missing from root .env")

    return create_client(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY,
    )


def test_supabase_connection():
    """
    Test the Supabase connection by querying
    the jewellery table.
    """

    try:
        client = get_supabase_client()

        response = client.table("jewellery").select("id").limit(1).execute()

        return {
            "success": True,
            "message": "Supabase connection successful",
            "data": response.data,
        }

    except Exception as error:

        return {
            "success": False,
            "message": str(error),
        }


def get_storage_bucket():
    """
    Return the configured Supabase Storage bucket.
    """

    return SUPABASE_STORAGE_BUCKET


# Backend Supabase client
supabase: Client = get_supabase_client()

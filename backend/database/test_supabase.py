
from backend.database import supabase


def test_supabase_connection():
    try:
        response = (
            supabase
            .table("jewellery")
            .select("id")
            .limit(1)
            .execute()
        )

        print("Supabase connection successful!")
        print("Returned records:", response.data)

    except Exception as error:
        print("Supabase connection failed!")
        print(error)


if __name__ == "__main__":
    test_supabase_connection()

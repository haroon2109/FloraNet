from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("SUPABASE_URL or SUPABASE_KEY is not set")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def fetch_farm_plots(user_id: str):
    client = get_supabase_client()
    response = client.table('farm_plots').select('*').eq('user_id', user_id).execute()
    return response.data

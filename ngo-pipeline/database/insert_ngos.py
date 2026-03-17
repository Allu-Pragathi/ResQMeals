import pandas as pd
from .supabase_client import get_supabase_client
from tqdm import tqdm

def insert_ngos_to_db(df: pd.DataFrame):
    """
    Insert NGO records into Supabase 'ngos' table.
    """
    supabase = get_supabase_client()
    
    # Convert dataframe to list of dicts
    # Rename columns if necessary to match supabase schema
    records = df.to_dict('records')
    
    print(f"Inserting {len(records)} records into Supabase...")
    
    # Batch insert (Supabase handles batching, but we can do it in chunks for safety)
    chunk_size = 100
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        try:
            supabase.table("ngos").insert(chunk).execute()
        except Exception as e:
            print(f"Error inserting chunk {i//chunk_size}: {e}")
            # Individual insert on failure?
            pass

def export_to_csv(df: pd.DataFrame, filename: str = "ngos_dataset_500.csv"):
    df.to_csv(filename, index=False)
    print(f"Dataset exported to {filename}")

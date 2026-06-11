import pandas as pd
import json
import os

def export_excel_to_json(excel_path, output_path):
    try:
        # We need to extract the questions from "Prima di iniziare" and "La tua realt" (might be encoded weirdly, so we use indices or try-except)
        xl = pd.ExcelFile(excel_path)
        
        # We will just read all sheets and convert to a big JSON dict
        result = {}
        for sheet in xl.sheet_names:
            try:
                df = xl.parse(sheet)
                # Convert to dict, dropna for cleaner json, but we just use json records
                records = df.fillna("").to_dict(orient="records")
                result[sheet] = records
            except Exception as e:
                print(f"Skipping {sheet} due to error: {e}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully exported {excel_path} to {output_path}")
    except Exception as e:
        print(f"Global Error: {e}")

if __name__ == "__main__":
    excel_file = "FAI_Microimpresa_v6(1).xlsx"
    output_file = "src/data/excel_dump.json"
    
    # Create dir if not exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    export_excel_to_json(excel_file, output_file)

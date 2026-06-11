import pandas as pd
import sys

def read_excel_info(file_path):
    try:
        # Read all sheets
        xl = pd.ExcelFile(file_path)
        print(f"Sheet names: {xl.sheet_names}\n")
        
        for sheet in xl.sheet_names:
            print(f"--- Sheet: {sheet} ---")
            df = xl.parse(sheet, nrows=20)  # Read first 20 rows to understand the structure
            print(df.head(20).to_string())
            print("\n")
            
    except Exception as e:
        print(f"Error reading file: {e}")

if __name__ == "__main__":
    file_path = "FAI_Microimpresa_v6(1).xlsx"
    read_excel_info(file_path)

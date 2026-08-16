import csv
import json

csv_path = r"C:\Users\asus\Downloads\www.weightlosspercentage.com-content-gap-sub_2026-08-16_20-39-56.csv"

try:
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        headers = next(reader)
        print("Headers:", headers)
        
        rows = list(reader)
        print(f"Total rows: {len(rows)}")
        
        # Display top 30 rows to understand schema and content
        print("\nTop 30 rows:")
        for r in rows[:30]:
            print(r[:6])
except Exception as e:
        print("Error reading CSV:", e)

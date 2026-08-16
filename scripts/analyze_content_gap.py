import csv
import json
from collections import defaultdict

csv_path = r"C:\Users\asus\Downloads\www.weightlosspercentage.com-content-gap-sub_2026-08-16_20-39-56.csv"

def parse_tsv():
    keywords = []
    with open(csv_path, 'r', encoding='utf-16') as f:
        reader = csv.reader(f, delimiter='\t')
        headers = next(reader)
        
        for idx, row in enumerate(reader):
            if not row or len(row) < 5:
                continue
            keyword = row[0].strip('"')
            entities = row[1].strip('"') if len(row) > 1 else ""
            intent = row[2].strip('"') if len(row) > 2 else ""
            
            try:
                volume = int(row[4].strip('"')) if len(row) > 4 and row[4].strip('"').isdigit() else 0
            except:
                volume = 0
                
            try:
                kd = int(row[5].strip('"')) if len(row) > 5 and row[5].strip('"').isdigit() else 0
            except:
                kd = 0
                
            competitor_url = row[16].strip('"') if len(row) > 16 else ""
            
            keywords.append({
                'keyword': keyword,
                'entities': entities,
                'intent': intent,
                'volume': volume,
                'kd': kd,
                'competitor_url': competitor_url
            })
            
    # Sort by Volume descending
    keywords.sort(key=lambda x: x['volume'], reverse=True)
    
    # Keyword Clustering by Topic & Search Intent
    clusters = defaultdict(list)
    for k in keywords:
        kw = k['keyword'].lower()
        if any(w in kw for w in ['newborn', 'infant', 'baby', 'birth weight', 'diaper', 'ounces in a pound']):
            clusters['Newborn & Baby Weight Growth & Loss'].append(k)
        elif any(w in kw for w in ['percent', 'percentage', 'calculate %', 'weight change', 'difference']):
            clusters['Weight Loss & Percent Change Calculators'].append(k)
        elif any(w in kw for w in ['dog', 'cat', 'pet']):
            clusters['Pet Weight Loss'].append(k)
        elif any(w in kw for w in ['bmi', 'body mass']):
            clusters['BMI & Body Percentiles'].append(k)
        elif any(w in kw for w in ['calorie', 'bmr', 'tdee', 'macro', 'deficit']):
            clusters['Calorie, TDEE & Nutrition'].append(k)
        else:
            clusters['General Weight Management'].append(k)

    print("=== CONTENT GAP KEYWORD CLUSTERING REPORT ===")
    for cluster_name, items in clusters.items():
        total_vol = sum(x['volume'] for x in items)
        print(f"\n[+] Cluster: {cluster_name} (Total Keywords: {len(items)}, Combined Volume: {total_vol})")
        top_in_cluster = sorted(items, key=lambda x: x['volume'], reverse=True)[:10]
        for t in top_in_cluster:
            v_str = str(t['volume'])
            kd_str = str(t['kd'])
            kw_str = t['keyword']
            print(f"   - {kw_str:<45} | Vol: {v_str:<6} | KD: {kd_str:<3}")

if __name__ == '__main__':
    parse_tsv()

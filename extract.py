import re, json

with open('skills.html', 'r', encoding='utf-8') as f:
    html = f.read()

skills = []
seen = set()
for m in re.finditer(r'\{"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)"', html):
    skill_id = m.group(2)
    if skill_id not in seen:
        skills.append({
            'source': m.group(1),
            'skillId': skill_id,
            'name': m.group(3)
        })
        seen.add(skill_id)

with open('skills.json', 'w') as f:
    json.dump(skills[:100], f, indent=2)

print(f"Extracted {len(skills)} unique skills from skills.sh")

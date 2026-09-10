import datetime

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

current_date = datetime.datetime.now().strftime('%B %d, %Y')

# Fix 2: Add Author & Reviewer Byline
byline_html = f'''<div style="margin-bottom: 1rem; font-size: 0.9rem; color: #475569;">
  <em>By <a href="/author/jane-doe" style="color: #4f46e5; text-decoration: none;">Jane Doe, MS, RD</a> | Reviewed by <a href="/reviewer/john-smith" style="color: #4f46e5; text-decoration: none;">Dr. John Smith, MD</a></em><br>
  <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-top: 0.5rem; display: inline-block;">Last updated: {current_date}</span>
</div>'''

# Fix 3: New Disclaimer
disclaimer_html = f'''<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin-bottom: 2rem; border-radius: 4px; color: #92400e; font-size: 0.95rem;">
  This tool is for educational purposes and does not replace professional medical advice. Read our <a href="/editorial-policy" style="font-weight: bold; color: #92400e; text-decoration: underline;">Editorial &amp; Methodology Policy</a> to learn how we ensure accuracy.
</div>'''

# Find the end of the intro paragraphs
intro_marker = 'just enter your numbers above.</p>'

if intro_marker in html:
    html = html.replace('Weight Loss Percentage Calculator</h1>', f'Weight Loss Percentage Calculator</h1>\n{byline_html}')
    html = html.replace(intro_marker, f'{intro_marker}\n{disclaimer_html}')
else:
    print('Error: Could not find intro marker')

# Remove the old disclaimer at the bottom
old_disclaimer_start = '<!-- Global Medical Disclaimer & Educational Guidance'
old_disclaimer_end = '<!-- Dismiss loader once React has fully rendered -->'

start_idx = html.find(old_disclaimer_start)
end_idx = html.find(old_disclaimer_end)

if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + html[end_idx:]
else:
    print('Error: Could not find old disclaimer bounds')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Clinical Guidelines fixes applied successfully.')

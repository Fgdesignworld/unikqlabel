import sys

file_path = r'd:\Hybrade apps\clients websites\laxmihome\src\app\admin\seo\page.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix corrupted UTF-8 sequences
fixes = [
    ('ðŸ ', '🏠'),
    ('ðŸ"–', '📖'),
    ('ðŸ"ž', '📞'),
    ('ðŸ›ï¸', '🛍️'),
    ('ðŸ«™', '🫙'),
    ('ðŸ¿', '🍿'),
    ('ðŸŒ¶ï¸', '🌶️'),
    ("ðŸ›'", '🛒'),
    ('â€¦', '…'),
    ('â"€', '─'),
]

for old, new in fixes:
    if old in content:
        print(f"Found: {repr(old)}, replacing with {repr(new)}")
        content = content.replace(old, new)
    else:
        print(f"Not found: {repr(old)}")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed!')

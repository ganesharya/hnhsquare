with open(r'C:\Users\csc\Desktop\hnhsquare-fullstack\app.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Remove duplicate admin_dashboard (lines 604-619, 0-indexed = 603-618)
del lines[603:619]

with open(r'C:\Users\csc\Desktop\hnhsquare-fullstack\app.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'Removed {619-603} lines. File now has {len(lines)} lines.')

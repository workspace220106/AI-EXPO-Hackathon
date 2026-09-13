import json
import sys

notebook_path = r'C:\Users\araji\Downloads\Mathplotlib\matplotlib_tutorial.ipynb'
with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

markdown_content = []
for cell in nb['cells']:
    if cell['cell_type'] == 'markdown':
        markdown_content.append(''.join(cell['source']))
    elif cell['cell_type'] == 'code':
        markdown_content.append('```python\n' + ''.join(cell['source']) + '\n```')

with open(r'C:\Users\araji\Downloads\Mathplotlib\tutorial.md', 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(markdown_content))
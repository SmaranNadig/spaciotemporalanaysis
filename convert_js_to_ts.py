import os

input_path = r'c:\Users\nadig\OneDrive\Desktop\dsael\src\web\realdata.js'
output_dir = r'c:\Users\nadig\OneDrive\Desktop\dsael\next-level-design-main\src\data'
output_path = os.path.join(output_dir, 'realCrimeData.ts')

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(input_path, 'r') as f:
    content = f.read()

# Replace the constant declaration with a TypeScript export
new_content = "import { Event } from '../types';\n\nexport const realCrimeData: Event[] = " + content.split('const realCrimeData = ')[1]

with open(output_path, 'w') as f:
    f.write(new_content)

print(f"Successfully converted {input_path} to {output_path}")

from PIL import Image
import os

# Output directory
output_dir = "blood_wave_images"
os.makedirs(output_dir, exist_ok=True)

# Skills needed (1-indexed as in the HTML filenames)
skills_needed = [7, 15, 23, 51, 55, 59, 75]

# Talents needed (1-indexed as in the HTML filenames)
talents_needed = [24, 27, 36, 41, 47, 50]

# Slice skills sprite sheet (horizontal strip, 136x136 icons)
print("Processing skills sprite sheet...")
skills_img = Image.open(f"{output_dir}/necro_skills.png")
skill_size = 136  # Each icon is 136x136
num_skills = skills_img.width // skill_size

print(f"Skills image: {skills_img.width}x{skills_img.height}, {num_skills} icons detected")

for idx in skills_needed:
    # Convert to 0-indexed
    i = idx - 1
    if i < num_skills:
        left = i * skill_size
        top = 0
        right = left + skill_size
        bottom = skill_size

        icon = skills_img.crop((left, top, right, bottom))
        filename = f"{output_dir}/2DUI_Skills_Necromancer_{idx}.webp"
        icon.save(filename, "WEBP", quality=90)
        print(f"Saved: {filename}")
    else:
        print(f"Warning: Skill index {idx} out of range (max: {num_skills})")

# Slice talents sprite sheet (grid layout)
print("\nProcessing talents sprite sheet...")
talents_img = Image.open(f"{output_dir}/necro_talents.png")

# The talents grid appears to be 8 columns
# 984 / 8 = 123 pixels per column
# Let's try 121x121 or 122x122 with some padding
talent_cols = 8
talent_width = talents_img.width // talent_cols  # 123
talent_height = talent_width  # Assume square

print(f"Talents image: {talents_img.width}x{talents_img.height}")
print(f"Calculated talent icon size: {talent_width}x{talent_height}")

num_talent_rows = talents_img.height // talent_height

for idx in talents_needed:
    # Convert to 0-indexed
    i = idx - 1
    row = i // talent_cols
    col = i % talent_cols

    if row < num_talent_rows:
        left = col * talent_width
        top = row * talent_height
        right = left + talent_width
        bottom = top + talent_height

        icon = talents_img.crop((left, top, right, bottom))
        filename = f"{output_dir}/2DUI_Talents_Necromancer_{idx}.webp"
        icon.save(filename, "WEBP", quality=90)
        print(f"Saved: {filename} (row {row}, col {col})")
    else:
        print(f"Warning: Talent index {idx} out of range")

print("\nDone!")

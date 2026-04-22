import os

file_path = "/Users/sameera/Developer/HYKE/_WIP/hl26001_lab01_dv_club-manager/hl26001_lab01_dv_club-manager_dev/app/[handle]/(dashboard)/settings/page.tsx"

with open(file_path, 'r') as f:
    lines = f.readlines()

# Correct block for the button
new_button_lines = [
    '             <button \n',
    '                onClick={handleCopy}\n',
    '                className={clsx(\n',
    '                   "flex h-9 min-w-[100px] items-center justify-center gap-1.5 rounded-lg border transition-all duration-200 text-xs font-semibold px-3 active:scale-95",\n',
    '                   copied \n',
    '                     ? "bg-emerald-50 border-emerald-200 text-emerald-600" \n',
    '                     : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50 hover:border-gray-300"\n',
    '                )}\n',
    '              >\n',
    '                {copied ? (\n',
    '                  <>\n',
    '                    <Check size={14} />\n',
    '                    <span>Copied!</span>\n',
    '                  </>\n',
    '                ) : (\n',
    '                  "Copy Link"\n',
    '                )}\n',
    '              </button>\n'
]

# We want to replace lines 296 to 302 (1-indexed)
# In 0-indexed list, that is lines[295] to lines[301]
lines[295:302] = new_button_lines

with open(file_path + '.tmp', 'w') as f:
    f.writelines(lines)

os.replace(file_path + '.tmp', file_path)
print("Successfully fixed syntax error in settings page.")

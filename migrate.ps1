mkdir apps -ErrorAction SilentlyContinue
mkdir apps\legacy-vite -ErrorAction SilentlyContinue
mkdir packages -ErrorAction SilentlyContinue

$items = Get-ChildItem -Exclude "apps","packages","package_root.json",".git",".env",".gemini","migrate.ps1",".vscode",".turbo"
foreach ($item in $items) {
    Move-Item -Path $item.FullName -Destination "apps\legacy-vite\" -Force
}

Move-Item -Path "package_root.json" -Destination "package.json" -Force

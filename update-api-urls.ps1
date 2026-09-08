# PowerShell script to update API URLs in frontend

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendURL
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Updating API URLs in Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Remove trailing slash if present
$BackendURL = $BackendURL.TrimEnd('/')

Write-Host "Backend URL: $BackendURL" -ForegroundColor Green
Write-Host ""

$clientPath = "client\src"
$oldURL = "http://localhost:3000"

# Get all JSX and JS files
$files = Get-ChildItem -Path $clientPath -Recurse -Include *.jsx,*.js

$filesUpdated = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match $oldURL) {
        $newContent = $content -replace [regex]::Escape($oldURL), $BackendURL
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "✓ Updated: $($file.Name)" -ForegroundColor Green
        $filesUpdated++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total files updated: $filesUpdated" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Update API URLs for production'" -ForegroundColor White
Write-Host "3. git push origin main" -ForegroundColor White
Write-Host ""

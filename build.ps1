# Build script for Windows
# Compiles the C++ spatio-temporal analytics engine

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  BUILDING SPATIO-TEMPORAL ANALYTICS ENGINE" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Create build directory
$buildDir = ".\build"
if (-not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
    Write-Host "✓ Created build directory" -ForegroundColor Green
}

# Change to src/cpp directory
Set-Location -Path ".\src\cpp"

Write-Host "`n🔨 Compiling C++ code..." -ForegroundColor Yellow

# Compile with g++
$compileCommand = "g++ -std=c++17 -O2 main.cpp -o ../../build/spatiotemporal.exe"

try {
    Invoke-Expression $compileCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Compilation successful!" -ForegroundColor Green
        
        # Return to root directory
        Set-Location -Path "../.."
        
        Write-Host "`n================================================" -ForegroundColor Cyan
        Write-Host "  BUILD COMPLETE" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "`nExecutable: .\build\spatiotemporal.exe" -ForegroundColor Green
        Write-Host "`nTo run:`n  cd build`n  .\spatiotemporal.exe`n" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Compilation failed" -ForegroundColor Red
        Set-Location -Path "../.."
        exit 1
    }
} catch {
    Write-Host "❌ Error during compilation: $_" -ForegroundColor Red
    Set-Location -Path "../.."
    exit 1
}

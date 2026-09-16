# Feyman Study-Check: notes index builder
# Scans all .md in vault (excluding hidden/system dirs), writes feynman/data/notes.js
# Run inside PowerShell 7 (pwsh):  & "<vault>/feynman/build-notes-index.ps1"
# The self-evolution loop runs this daily (see 11-前沿进化/_进化规则.md section 6)

$ErrorActionPreference = "Stop"
$scriptFile = $PSCommandPath
if (-not $scriptFile) { $scriptFile = $MyInvocation.MyCommand.Path }
if (-not $scriptFile) { throw "Run this script via a file path, e.g.: & '.../feynman/build-notes-index.ps1'" }
$root = Split-Path -Parent $scriptFile            # .../feynman
$vault = Split-Path -Parent $root                 # vault root

$outDir = Join-Path $root "data"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }
$outFile = Join-Path $outDir "notes.js"

$exclude = @(".obsidian", ".codely-cli", ".codely", ".git", ".refsrc", ".trash", "feynman", "practice")
$notes = New-Object System.Collections.Generic.List[object]

$files = Get-ChildItem -LiteralPath $vault -Filter *.md -Recurse -File |
  Where-Object {
    $rel = $_.FullName.Substring($vault.Length + 1)
    $parts = $rel -split "[\\/]"
    $ok = $true
    foreach ($p in $parts) { if ($exclude -contains $p) { $ok = $false; break } }
    $ok
  }

foreach ($f in $files) {
  $rel = $f.FullName.Substring($vault.Length + 1) -replace "\\", "/"
  $dir = Split-Path -Parent $rel
  if ($dir -eq ".") { $dir = "" }
  $firstLine = ""
  foreach ($line in (Get-Content -LiteralPath $f.FullName -TotalCount 40 -Encoding UTF8)) {
    if ($line -match "^#\s+(.+)$") { $firstLine = $Matches[1].Trim(); break }
  }
  if ($firstLine -eq "") { $firstLine = [IO.Path]::GetFileNameWithoutExtension($rel) }
  $raw = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
  $notes.Add([ordered]@{
    path = $rel
    title = $firstLine
    dir = $dir
    mtime = $f.LastWriteTime.ToString("yyyy-MM-dd")
    size = $raw.Length
    content = $raw
  })
}

$byDir = [ordered]@{}
foreach ($n in $notes) {
  $d = if ($n.dir) { $n.dir } else { "(root)" }
  if (-not $byDir.Contains($d)) { $byDir[$d] = 0 }
  $byDir[$d] = $byDir[$d] + 1
}

$meta = [ordered]@{
  generatedAt = (Get-Date).ToString("yyyy-MM-dd HH:mm")
  total = $notes.Count
  byDir = $byDir
}

$json = ConvertTo-Json -InputObject @{ meta = $meta; notes = $notes } -Depth 6 -Compress
[IO.File]::WriteAllText($outFile, "window.NOTES_INDEX = " + $json + ";", (New-Object System.Text.UTF8Encoding($false)))

Write-Host ("[OK] index built: {0} notes, {1} KB -> {2}" -f $notes.Count, [math]::Round((Get-Item $outFile).Length / 1KB), $outFile)

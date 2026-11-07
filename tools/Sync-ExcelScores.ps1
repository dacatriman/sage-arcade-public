param(
  [Parameter(Mandatory = $true)][string]$WorkbookPath,
  [string]$OutputPath = 'assets/data.js',
  [switch]$TestData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression

$workbook = (Resolve-Path -LiteralPath $WorkbookPath).Path
$stream = [IO.FileStream]::new($workbook, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::ReadWrite)
$zip = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Read)

try {
  function Read-Entry([string]$entryName) {
    $entry = $zip.GetEntry($entryName)
    if (-not $entry) { throw "Missing Excel entry: $entryName" }
    $reader = [IO.StreamReader]::new($entry.Open())
    try { return [xml]$reader.ReadToEnd() } finally { $reader.Dispose() }
  }

  $mainNs = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
  $bookXml = Read-Entry 'xl/workbook.xml'
  $relsXml = Read-Entry 'xl/_rels/workbook.xml.rels'
  $bookNs = [Xml.XmlNamespaceManager]::new($bookXml.NameTable)
  $bookNs.AddNamespace('x', $mainNs)
  $bookNs.AddNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
  $relNs = [Xml.XmlNamespaceManager]::new($relsXml.NameTable)
  $relNs.AddNamespace('p', 'http://schemas.openxmlformats.org/package/2006/relationships')

  function Get-Sheet([string]$name) {
    $sheet = $bookXml.SelectSingleNode("//x:sheet[@name='$name']", $bookNs)
    if (-not $sheet) { throw "Missing worksheet: $name" }
    $id = $sheet.GetAttribute('id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
    $rel = $relsXml.SelectSingleNode("//p:Relationship[@Id='$id']", $relNs)
    if (-not $rel) { throw "Missing worksheet relationship: $name" }
    $target = $rel.GetAttribute('Target').TrimStart('/')
    if (-not $target.StartsWith('xl/')) { $target = 'xl/' + $target }
    $xml = Read-Entry $target
    $ns = [Xml.XmlNamespaceManager]::new($xml.NameTable)
    $ns.AddNamespace('x', $mainNs)
    return @{ Xml = $xml; Ns = $ns }
  }

  $shared = @()
  if ($zip.GetEntry('xl/sharedStrings.xml')) {
    $sharedXml = Read-Entry 'xl/sharedStrings.xml'
    $sharedNs = [Xml.XmlNamespaceManager]::new($sharedXml.NameTable)
    $sharedNs.AddNamespace('x', $mainNs)
    $shared = @($sharedXml.SelectNodes('//x:si', $sharedNs) | ForEach-Object { $_.InnerText })
  }

  function Get-Value($sheet, [string]$address) {
    $cell = $sheet.Xml.SelectSingleNode("//x:c[@r='$address']", $sheet.Ns)
    if (-not $cell) { return $null }
    $value = $cell.SelectSingleNode('x:v', $sheet.Ns)
    if (-not $value) { return $null }
    if ($cell.GetAttribute('t') -eq 's') { return $shared[[int]$value.InnerText] }
    return $value.InnerText
  }

  function Get-Number($sheet, [string]$address, [bool]$required = $false) {
    $raw = Get-Value $sheet $address
    if ($null -eq $raw -or $raw -eq '') {
      if ($required) { throw "Missing numeric value in $address" }
      return 0.0
    }
    $result = 0.0
    if (-not [double]::TryParse([string]$raw, [Globalization.NumberStyles]::Float, [Globalization.CultureInfo]::InvariantCulture, [ref]$result)) {
      throw "Invalid numeric value in $address"
    }
    if ($result -lt 0) { throw "Negative value in $address" }
    return $result
  }

  $calendar = Get-Sheet 'Calendar & Rules'
  $tracker = Get-Sheet 'SQO Tracker'
  $stage = [int](Get-Number $calendar 'B5' $true)
  if ($stage -lt 1 -or $stage -gt 8) { throw 'Calendar & Rules!B5 must be a closed stage from 1 to 8.' }

  $stageColumns = @(@('G'), @('H'), @('I'), @('J', 'K'), @('L'), @('M'), @('N'), @('O'))
  $activeColumns = @()
  for ($i = 0; $i -lt $stage; $i++) { $activeColumns += $stageColumns[$i] }
  $calendarRow = 9 + $stage
  $novShare = Get-Number $calendar "D$calendarRow" $true
  $decShare = Get-Number $calendar "E$calendarRow" $true
  $productNames = @{ 'S50 + Active' = 'Sage 50 + Active'; S200 = 'Sage 200'; X3 = 'X3' }
  $totals = @{}
  foreach ($team in @('A', 'B', 'C')) {
    $totals[$team] = @{}
    foreach ($product in $productNames.Values) { $totals[$team][$product] = @{ SQO = 0.0; Target = 0.0 } }
  }

  for ($row = 5; $row -le 70; $row++) {
    $team = Get-Value $tracker "A$row"
    $sourceProduct = Get-Value $tracker "D$row"
    if ($team -notin @('A', 'B', 'C') -or -not $productNames.ContainsKey($sourceProduct)) { continue }
    $product = $productNames[$sourceProduct]
    $bucket = $totals[$team][$product]
    $bucket.Target += (Get-Number $tracker "E$row") * $novShare + (Get-Number $tracker "F$row") * $decShare
    foreach ($column in $activeColumns) { $bucket.SQO += Get-Number $tracker "$column$row" }
  }

  $teams = [ordered]@{}
  foreach ($team in @('A', 'B', 'C')) {
    $products = [ordered]@{}
    $teamSQO = 0.0
    $teamTarget = 0.0
    foreach ($product in @('Sage 50 + Active', 'Sage 200', 'X3')) {
      $bucket = $totals[$team][$product]
      if ($bucket.Target -le 0) { throw "No cumulative target for team $team, $product" }
      $products[$product] = [math]::Round(100 * $bucket.SQO / $bucket.Target, 2)
      $teamSQO += $bucket.SQO
      $teamTarget += $bucket.Target
    }
    $teams[$team] = [ordered]@{
      overall = [math]::Round(100 * $teamSQO / $teamTarget, 2)
      products = $products
    }
  }

  $scores = [ordered]@{
    closedStage = $stage
    testData = [bool]$TestData
    updatedAt = (Get-Date).ToString('yyyy-MM-ddTHH:mm:sszzz')
    teams = $teams
  }
  $json = ConvertTo-Json -InputObject $scores -Depth 6
  $destination = [IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
  [IO.File]::WriteAllText($destination, "window.ARCADE_SCORES = $json;`n", [Text.UTF8Encoding]::new($false))
  Write-Output "Wrote $destination from $workbook (stage $stage, test data: $([bool]$TestData))."
} finally {
  $zip.Dispose()
  $stream.Dispose()
}

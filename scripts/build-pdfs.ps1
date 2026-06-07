# Build PDF files from markdown using Pandoc (Windows PowerShell)
if (-not (Get-Command pandoc -ErrorAction SilentlyContinue)) {
    Write-Error "Pandoc is not installed. Install Pandoc to build PDFs: https://pandoc.org/installing.html"
    exit 1
}

$docs = Get-ChildItem -Path "..\docs" -Filter "*.md" -File
foreach ($doc in $docs) {
    $pdf = "..\docs\$($doc.BaseName).pdf"
    Write-Output "Converting $($doc.Name) -> $($pdf)"
    pandoc $doc.FullName -o $pdf --pdf-engine=xelatex
}

Write-Output "All done. PDFs placed in docs/."

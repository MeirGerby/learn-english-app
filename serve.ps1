# Minimal static file server for local development (no Node/Python required).
# Usage: powershell -File serve.ps1 [-Port 8080]
param(
  [int]$Port = 8080
)

$root = $PSScriptRoot
$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Serving $root at http://localhost:$Port/  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $response.SendChunked = $false
    $response.KeepAlive = $false

    try {
      $localPath = $request.Url.LocalPath
      if ($localPath -eq "/") { $localPath = "/index.html" }
      $filePath = Join-Path $root ($localPath.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar)

      if (Test-Path $filePath -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($filePath)
        $contentType = $mimeTypes[$ext]
        if (-not $contentType) { $contentType = "application/octet-stream" }
        [byte[]]$bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType = $contentType
        $response.ContentLength64 = [int64]$bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $response.StatusCode = 404
        [byte[]]$notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
        $response.ContentLength64 = [int64]$notFound.Length
        $response.OutputStream.Write($notFound, 0, $notFound.Length)
      }
    } catch {
      Write-Output "Request error: $_"
    } finally {
      $response.OutputStream.Flush()
      $response.Close()
    }
  }
} finally {
  $listener.Stop()
}

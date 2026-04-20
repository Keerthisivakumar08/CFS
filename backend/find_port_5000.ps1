$c = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($null -eq $c) {
  Write-Output "No listener on port 5000"
  exit 0
}
Write-Output ("PID=" + $c.OwningProcess)
try {
  $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
  if ($p) {
    Write-Output ("ProcessName=" + $p.ProcessName)
    Write-Output ("Path=" + $p.Path)
  }
} catch {}


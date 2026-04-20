$body = @{
  email = 'admin@system.com'
  password = 'Admin@123'
}

$json = $body | ConvertTo-Json -Depth 10
$resp = Invoke-WebRequest -Method Post -Uri 'http://localhost:5000/api/auth/login' -ContentType 'application/json' -Body $json -SkipHttpErrorCheck
Write-Output ("status=" + $resp.StatusCode)
Write-Output ("content=" + $resp.Content)


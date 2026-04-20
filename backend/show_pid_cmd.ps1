$pidValue = 19552
$p = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $pidValue)
if ($p) {
  $p | Select-Object ProcessId, CommandLine | Format-List *
} else {
  Write-Output "Process not found"
}


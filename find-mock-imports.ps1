Get-ChildItem -Recurse -Path "C:\Users\runtime\Documents\red-button-app\src" -Include "*.tsx","*.ts" |
  Where-Object { $_.FullName -notmatch "mock\.ts|mock-admin\.ts|mock-orders\.ts|constants\.ts|admin-constants\.ts|order-constants\.ts|node_modules" } |
  ForEach-Object {
    $lines = Select-String -Path $_.FullName -Pattern 'from "@/data/mock'
    if ($lines) {
      foreach ($l in $lines) {
        $rel = $_.FullName.Replace("C:\Users\runtime\Documents\red-button-app\", "")
        Write-Output "$rel`:$($l.LineNumber): $($l.Line.Trim())"
      }
    }
  }

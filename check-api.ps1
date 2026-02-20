Get-ChildItem -Recurse -Path "C:\Users\runtime\Documents\red-button-app\src\app\api" -Filter "route.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $methods = [regex]::Matches($content, 'export async function (GET|POST|PUT|PATCH|DELETE)') | ForEach-Object { $_.Groups[1].Value }
    $rel = $_.FullName.Replace("C:\Users\runtime\Documents\red-button-app\src\app\api\", "")
    Write-Output "$rel`: $($methods -join ', ')"
}

Add-Type -AssemblyName System.Drawing
$path = 'd:\DEMO WEBSITES\business portfolio\static_backup\assets\logo.png'
$tempPath = 'd:\DEMO WEBSITES\business portfolio\static_backup\assets\logo_temp.png'
$bmp = New-Object System.Drawing.Bitmap $path
for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
    }
}
$bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Remove-Item $path -Force
Rename-Item $tempPath 'logo.png'
Write-Host "Done"

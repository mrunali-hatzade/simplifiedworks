Add-Type -AssemblyName System.Drawing
$path = 'd:\DEMO WEBSITES\business portfolio\static_backup\assets\logo.png'
$outPath = 'd:\DEMO WEBSITES\business portfolio\static_backup\assets\logo_merged.png'
$bmp = New-Object System.Drawing.Bitmap $path
$font1 = New-Object System.Drawing.Font('Arial', 32, [System.Drawing.FontStyle]::Bold)
$font2 = New-Object System.Drawing.Font('Arial', 18, [System.Drawing.FontStyle]::Bold)
$brush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$brush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 184, 166))
$newWidth = $bmp.Width + 450
$newHeight = [Math]::Max($bmp.Height, 100)
$newBmp = New-Object System.Drawing.Bitmap $newWidth, $newHeight
$g = [System.Drawing.Graphics]::FromImage($newBmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Transparent)
$g.DrawImage($bmp, 0, ($newHeight - $bmp.Height) / 2, $bmp.Width, $bmp.Height)
$g.DrawString('Simplified Works', $font1, $brush1, $bmp.Width + 10, $newHeight / 2 - 25)
$g.DrawString('DIGITAL SOLUTIONS', $font2, $brush2, $bmp.Width + 15, $newHeight / 2 + 15)
$newBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$newBmp.Dispose()
$bmp.Dispose()
Write-Host "Created merged logo"

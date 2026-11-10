# Normaliza el .pptx generado por build.js volviéndolo a guardar con PowerPoint.
#
# Por qué: pptxgenjs escribe algunos elementos que PowerPoint 2010 no entiende, y al abrir el archivo
# muestra «encontró contenido que no entendió; el contenido se quitó». Si PowerPoint guarda el archivo
# él mismo, queda con su formato propio y se abre sin avisos. Verificado: mismas 49 diapositivas, formas,
# tablas y notas; el texto es idéntico.
#
# Uso (Windows con PowerPoint instalado y SIN otras presentaciones abiertas que deban conservarse):
#   powershell -File docs\_build\presentacion\normalizar-con-powerpoint.ps1
param(
    [string]$Archivo = (Join-Path $PSScriptRoot '..\..\C4-Desarrollo-de-Software-Biblioteca.pptx')
)
$Archivo = (Resolve-Path $Archivo).Path
$copia = [IO.Path]::Combine([IO.Path]::GetTempPath(), 'normalizada-' + [IO.Path]::GetFileName($Archivo))
$ppt = New-Object -ComObject PowerPoint.Application
try {
    $ppt.DisplayAlerts = 1                      # ppAlertsNone
    $pres = $ppt.Presentations.Open($Archivo, -1, 0, 0)   # solo lectura, sin ventana
    $pres.SaveCopyAs($copia)
    $pres.Close()
} finally {
    if ($ppt.Presentations.Count -eq 0) { $ppt.Quit() }
}
Move-Item $copia $Archivo -Force
Write-Host "Normalizado con PowerPoint: $Archivo"

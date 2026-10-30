param(
  [string]$SourceDirectory = (Join-Path $PSScriptRoot '..\src-assets\sequence-274-originals'),
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\src-assets\sequence-30-enhanced')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not ('StJacobs.FrameEnhancer' -as [type])) {
  $drawingAssembly = [System.Drawing.Bitmap].Assembly.Location
  $gdiAssembly = Join-Path ([System.Runtime.InteropServices.RuntimeEnvironment]::GetRuntimeDirectory()) 'System.Private.Windows.GdiPlus.dll'
  $windowsCoreAssembly = Join-Path ([System.Runtime.InteropServices.RuntimeEnvironment]::GetRuntimeDirectory()) 'System.Private.Windows.Core.dll'
  $drawingPrimitives = [System.Drawing.Rectangle].Assembly.Location
  Add-Type -ReferencedAssemblies @($drawingAssembly,$drawingPrimitives,$gdiAssembly,$windowsCoreAssembly) -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

namespace StJacobs {
  public static class FrameEnhancer {
    private static byte Clamp(double value) { return (byte)Math.Max(0, Math.Min(255, Math.Round(value))); }

    public static void Process(string input, string output, int targetWidth) {
      using (var source = new Bitmap(input)) {
        int targetHeight = (int)Math.Round(source.Height * (targetWidth / (double)source.Width));
        using (var resized = new Bitmap(targetWidth, targetHeight, PixelFormat.Format24bppRgb)) {
          resized.SetResolution(96, 96);
          using (var graphics = Graphics.FromImage(resized)) {
            graphics.CompositingMode = CompositingMode.SourceCopy;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.SmoothingMode = SmoothingMode.HighQuality;
            using (var attributes = new ImageAttributes()) {
              // Mild contrast and saturation lift; deliberately conservative for frame consistency.
              var matrix = new ColorMatrix(new float[][] {
                new float[] {1.052f,-.010f,-.010f,0,0},
                new float[] {-.018f,1.045f,-.018f,0,0},
                new float[] {-.006f,-.006f,1.050f,0,0},
                new float[] {0,0,0,1,0},
                new float[] {-.006f,-.006f,-.006f,0,1}
              });
              attributes.SetColorMatrix(matrix);
              graphics.DrawImage(source, new Rectangle(0,0,targetWidth,targetHeight), 0,0,source.Width,source.Height, GraphicsUnit.Pixel, attributes);
            }
          }

          var rect = new Rectangle(0,0,resized.Width,resized.Height);
          var data = resized.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
          int bytes = Math.Abs(data.Stride) * data.Height;
          byte[] original = new byte[bytes];
          byte[] sharpened = new byte[bytes];
          Marshal.Copy(data.Scan0, original, 0, bytes);
          Buffer.BlockCopy(original, 0, sharpened, 0, bytes);
          const double amount = .055;
          for (int y=1; y<data.Height-1; y++) {
            int row = y * data.Stride;
            for (int x=1; x<data.Width-1; x++) {
              int p = row + x*3;
              for (int c=0; c<3; c++) {
                double value = original[p+c] * (1 + 4*amount)
                  - amount * (original[p-3+c] + original[p+3+c] + original[p-data.Stride+c] + original[p+data.Stride+c]);
                sharpened[p+c] = Clamp(value);
              }
            }
          }
          Marshal.Copy(sharpened, 0, data.Scan0, bytes);
          resized.UnlockBits(data);

          var codec = Array.Find(ImageCodecInfo.GetImageEncoders(), item => item.FormatID == ImageFormat.Jpeg.Guid);
          using (var parameters = new EncoderParameters(1)) {
            parameters.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 92L);
            resized.Save(output, codec, parameters);
          }
        }
      }
    }
  }
}
'@
}

$files = Get-ChildItem -LiteralPath $SourceDirectory -Filter '*.jpg' | Sort-Object Name
if ($files.Count -lt 30) { throw "Expected at least 30 frames; found $($files.Count)." }

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

$selected = for ($i=0; $i -lt 30; $i++) {
  $sourceIndex = [Math]::Round($i * ($files.Count - 1) / 29)
  [pscustomobject]@{ OutputIndex=$i+1; SourceIndex=$sourceIndex+1; File=$files[$sourceIndex] }
}

foreach ($frame in $selected) {
  $output = Join-Path $OutputDirectory ('ezgif-frame-{0:D3}.jpg' -f $frame.OutputIndex)
  if (Test-Path -LiteralPath $output) {
    Write-Host (('{0:000}' -f [int]$frame.OutputIndex) + ' already enhanced')
    continue
  }
  [StJacobs.FrameEnhancer]::Process($frame.File.FullName, $output, 1920)
  Write-Host (('{0:000}' -f [int]$frame.OutputIndex) + ' <- source ' + ('{0:000}' -f [int]$frame.SourceIndex))
}

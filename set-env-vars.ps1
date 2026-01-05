# PowerShell script to set environment variables for Serverless deployment
# Run this before deploying: .\set-env-vars.ps1

# Read from .env file if it exists, otherwise prompt for values
if (Test-Path .env) {
    Write-Host "Loading variables from .env file..."
    Get-Content .env | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
            Write-Host "Set $name"
        }
    }
} else {
    Write-Host ".env file not found. Please set environment variables manually:"
    Write-Host '$env:MONGODB_URI="your-connection-string"'
    Write-Host '$env:JWT_SECRET="your-secret-key"'
}

Write-Host "`nEnvironment variables set. You can now run: npm run deploy:dev"


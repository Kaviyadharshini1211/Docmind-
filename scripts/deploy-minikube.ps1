# PowerShell deploy script for Minikube
# Usage: .\scripts\deploy-minikube.ps1
#
# Prerequisites:
#   • minikube installed and running  →  minikube start
#   • kubectl configured to use minikube context
#   • k8s/secrets.yaml filled with real values (never committed)

param(
  [switch]$Reset  # Pass -Reset to delete and re-create all resources
)

$K8S = "$PSScriptRoot\..\k8s"

Write-Host "`n🚀 DocMind — Minikube Deploy Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# ── Verify minikube is running
Write-Host "`n[1/7] Checking Minikube status..." -ForegroundColor Yellow
$status = minikube status --format "{{.Host}}" 2>&1
if ($status -ne "Running") {
  Write-Host "❌ Minikube is not running. Start it with: minikube start" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Minikube is Running" -ForegroundColor Green

# ── Optional: full reset
if ($Reset) {
  Write-Host "`n⚠️  -Reset flag detected — deleting all existing DocMind resources..." -ForegroundColor Red
  kubectl delete -f "$K8S\" --ignore-not-found=true
  Start-Sleep -Seconds 5
}

# ── Apply RBAC (Prometheus needs cluster read permissions)
Write-Host "`n[2/7] Applying RBAC for Prometheus..." -ForegroundColor Yellow
kubectl apply -f "$K8S\rbac.yaml"

# ── Apply Secrets (must exist before Deployments that reference them)
Write-Host "`n[3/7] Applying Secrets..." -ForegroundColor Yellow
if (-Not (Test-Path "$K8S\secrets.yaml")) {
  Write-Host "❌ k8s/secrets.yaml not found!" -ForegroundColor Red
  Write-Host "   Copy k8s/secrets.example.yaml → k8s/secrets.yaml and fill in real values." -ForegroundColor Red
  exit 1
}
kubectl apply -f "$K8S\secrets.yaml"

# ── Apply Monitoring stack (Prometheus + Grafana)
Write-Host "`n[4/7] Deploying Monitoring stack (Prometheus + Grafana)..." -ForegroundColor Yellow
kubectl apply -f "$K8S\prometheus.yaml"
kubectl apply -f "$K8S\grafana-pvc.yaml"
kubectl apply -f "$K8S\grafana-datasource-configmap.yaml"
kubectl apply -f "$K8S\grafana.yaml"

# ── Apply Application (backend + frontend)
Write-Host "`n[5/7] Deploying Application..." -ForegroundColor Yellow
kubectl apply -f "$K8S\backend-deployment.yaml"
kubectl apply -f "$K8S\backend-service.yaml"
kubectl apply -f "$K8S\frontend-deployment.yaml"
kubectl apply -f "$K8S\frontend-service.yaml"
kubectl apply -f "$K8S\hpa.yaml"

# ── Wait for rollout
Write-Host "`n[6/7] Waiting for deployments to become ready..." -ForegroundColor Yellow
kubectl rollout status deployment/docmind-backend --timeout=120s
kubectl rollout status deployment/frontend --timeout=120s
kubectl rollout status deployment/prometheus --timeout=120s
kubectl rollout status deployment/grafana --timeout=120s

# ── Print access URLs
Write-Host "`n[7/7] Getting service URLs..." -ForegroundColor Yellow
$backendUrl  = minikube service docmind-backend-service --url 2>&1
$frontendUrl = minikube service frontend-service --url 2>&1
$prometheusUrl = minikube service prometheus-service --url 2>&1
$grafanaUrl  = minikube service grafana-service --url 2>&1

Write-Host "`n✅ All resources deployed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🌐 Frontend:   $frontendUrl" -ForegroundColor White
Write-Host "🔌 Backend:    $backendUrl" -ForegroundColor White
Write-Host "📊 Prometheus: $prometheusUrl" -ForegroundColor White
Write-Host "📈 Grafana:    $grafanaUrl" -ForegroundColor White
Write-Host "   Grafana login: admin / (your GRAFANA_ADMIN_PASSWORD from secrets.yaml)" -ForegroundColor Gray
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

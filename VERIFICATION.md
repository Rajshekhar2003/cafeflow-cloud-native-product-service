# Verification record

Verification performed on 29 July 2026.

## Completed checks

| Check | Result |
| --- | --- |
| Dependency installation | Passed |
| JavaScript syntax check | Passed |
| Apollo GraphQL schema startup | Passed |
| HTTP root and liveness smoke test | Passed |
| Readiness without MongoDB | Returned expected HTTP 503 |
| Postman collection JSON parsing | Passed |
| Automated tests | 39 of 39 passed |
| Statement coverage | 96.37% |
| Branch coverage | 90.07% |
| Function coverage | 100% |
| Line coverage | 96.35% |
| Docker Compose YAML parsing | Passed |
| Kubernetes YAML parsing and required-field inspection | Passed |

## Local end-to-end verification

Verified on 29 July 2026 using Windows, Docker Desktop and Docker Desktop
Kubernetes.

- Docker Compose started MongoDB and the product service successfully.
- Both Docker Compose containers reached healthy status.
- Kubernetes deployed two product-service replicas and one MongoDB replica.
- All three Kubernetes pods reached `Running` and `Ready` status with zero
  restarts.
- The application ConfigMap, Secret and two ClusterIP Services were created.
- The readiness endpoint returned `READY` with MongoDB reported as `UP`.
- All 39 automated tests passed locally.
- Coverage results matched the recorded statement, branch, function and line
  percentages.

## Scope note

The bundled MongoDB Kubernetes deployment uses `emptyDir` storage and is
intended for local learning. Its data is not persistent when the MongoDB pod or
namespace is deleted.

# CafeFlow – Cloud-Native Product Catalog Service

# 

# CafeFlow is a production-structured GraphQL product catalog built with Node.js,Express, Apollo Server, MongoDB and Mongoose. It provides product and inventorymanagement through GraphQL, containerized local execution with Docker Compose,and a Kubernetes deployment with configuration management and health probes.

# 

# Architecture

# 

# flowchart TD

# &#x20;   Client\["GraphQL client"] --> ApiService\["Kubernetes Service :4000"]

# &#x20;   ApiService --> Api1\["Product API replica 1"]

# &#x20;   ApiService --> Api2\["Product API replica 2"]

# &#x20;   Api1 --> DbService\["MongoDB Service :27017"]

# &#x20;   Api2 --> DbService

# &#x20;   DbService --> MongoDB\[(MongoDB)]

# &#x20;   Config\["ConfigMap + Secret"] --> Api1

# &#x20;   Config --> Api2

# 

# Technology stack

# 

# Node.js 20+ and Express 5

# 

# Apollo Server and GraphQL

# 

# MongoDB and Mongoose

# 

# Vitest and V8 coverage

# 

# Docker and Docker Compose

# 

# Kubernetes

# 

# Implemented capabilities

# 

# Create, read, update and delete products

# 

# Unique, normalized product SKU

# 

# Pagination with page metadata

# 

# Sorting by creation date, update date, name, price or stock quantity

# 

# Search by product name or SKU

# 

# Filtering by category and active status

# 

# Low-stock filtering and computed inventory status

# 

# Consistent BAD\_USER\_INPUT, NOT\_FOUND and CONFLICT GraphQL errors

# 

# REST liveness and dependency-aware readiness endpoints

# 

# Structured logs and graceful shutdown

# 

# Non-root Docker runtime

# 

# Kubernetes Deployments, Services, ConfigMap, Secret, health probes andresource limits

# 

# Project structure

# 

# cafeflow-product-service/

# ├── src/

# │   ├── config/

# │   ├── graphql/

# │   ├── models/

# │   ├── services/

# │   ├── utils/

# │   ├── app.js

# │   └── server.js

# ├── tests/

# ├── kubernetes/

# │   ├── namespace.yaml

# │   ├── configmap.yaml

# │   ├── secret.example.yaml

# │   ├── mongodb-deployment.yaml

# │   ├── mongodb-service.yaml

# │   ├── product-deployment.yaml

# │   └── product-service.yaml

# ├── postman/

# ├── .env.example

# ├── Dockerfile

# ├── docker-compose.yml

# ├── package.json

# ├── vitest.config.js

# ├── VERIFICATION.md

# └── README.md

# 

# Quick start with Docker

# 

# Make sure Docker Desktop is running, then execute:

# 

# docker compose up --build

# 

# Available endpoints:

# 

# GraphQL API: http://localhost:4000/graphql

# 

# Liveness: http://localhost:4000/health/live

# 

# Readiness: http://localhost:4000/health/ready

# 

# Check container status:

# 

# docker compose ps

# 

# Both cafeflow-mongodb and cafeflow-product-service should reporthealthy.

# 

# Stop the containers while preserving MongoDB data:

# 

# docker compose down

# 

# Remove the containers and MongoDB volume:

# 

# docker compose down -v

# 

# docker compose down -v permanently deletes the local database volume.

# 

# Local start without Docker

# 

# Start MongoDB on port 27017.

# 

# Linux or macOS:

# 

# cp .env.example .env

# npm ci

# npm start

# 

# Windows PowerShell:

# 

# Copy-Item .env.example .env

# npm ci

# npm start

# 

# API testing

# 

# Postman is optional. A collection is available at:

# 

# postman/CafeFlow-GraphQL.postman\_collection.json

# 

# The GraphQL API can be tested directly from PowerShell:

# 

# $body = @{

# &#x20;   query = "query { \_\_typename }"

# } | ConvertTo-Json

# 

# Invoke-RestMethod `

# &#x20;   -Uri "http://localhost:4000/graphql" `

# &#x20;   -Method Post `

# &#x20;   -ContentType "application/json" `

# &#x20;   -Body $body |

# &#x20;   ConvertTo-Json -Depth 10

# 

# Expected response:

# 

# {

# &#x20; "data": {

# &#x20;   "\_\_typename": "Query"

# &#x20; }

# }

# 

# The Apollo browser landing page can require internet access to load its fullinterface. This does not affect the GraphQL HTTP API.

# 

# Example GraphQL operations

# 

# Create a product

# 

# mutation {

# &#x20; createProduct(

# &#x20;   input: {

# &#x20;     sku: "COF-101"

# &#x20;     name: "Cappuccino"

# &#x20;     description: "Espresso with steamed milk"

# &#x20;     price: 180

# &#x20;     stockQuantity: 20

# &#x20;     categoryId: "coffee"

# &#x20;   }

# &#x20; ) {

# &#x20;   id

# &#x20;   sku

# &#x20;   name

# &#x20;   stockQuantity

# &#x20;   inventoryStatus

# &#x20; }

# }

# 

# List and filter products

# 

# query {

# &#x20; products(

# &#x20;   page: 1

# &#x20;   limit: 10

# &#x20;   search: "coffee"

# &#x20;   categoryId: "coffee"

# &#x20;   active: true

# &#x20;   sortBy: PRICE

# &#x20;   sortDirection: ASC

# &#x20; ) {

# &#x20;   items {

# &#x20;     id

# &#x20;     sku

# &#x20;     name

# &#x20;     price

# &#x20;     stockQuantity

# &#x20;     inventoryStatus

# &#x20;   }

# &#x20;   pageInfo {

# &#x20;     page

# &#x20;     limit

# &#x20;     totalItems

# &#x20;     totalPages

# &#x20;     hasNextPage

# &#x20;     hasPreviousPage

# &#x20;   }

# &#x20; }

# }

# 

# Update stock

# 

# mutation {

# &#x20; updateProductStock(

# &#x20;   id: "REPLACE\_WITH\_PRODUCT\_ID"

# &#x20;   stockQuantity: 4

# &#x20; ) {

# &#x20;   id

# &#x20;   stockQuantity

# &#x20;   inventoryStatus

# &#x20;   updatedAt

# &#x20; }

# }

# 

# Automated tests

# 

# Install dependencies and run the test suite:

# 

# npm ci

# npm test

# npm run test:coverage

# 

# The test suite contains 39 tests covering validation, duplicate SKU handling,lookup, updates, deletion, pagination, error mapping and query-filterconstruction.

# 

# Verified coverage across the tested service and validation modules:

# 

# Metric

# 

# Coverage

# 

# Statements

# 

# 96.37%

# 

# Branches

# 

# 90.07%

# 

# Functions

# 

# 100%

# 

# Lines

# 

# 96.35%

# 

# Coverage thresholds are enforced by vitest.config.js.

# 

# Kubernetes deployment

# 

# The supplied MongoDB deployment uses emptyDir and is intended for locallearning. Use a persistent volume or a managed MongoDB service for persistentenvironments.

# 

# 1\. Build the application image

# 

# docker build -t cafeflow-product-service:1.0.0 .

# 

# Docker Desktop Kubernetes normally has direct access to locally built images.For Minikube:

# 

# minikube image load cafeflow-product-service:1.0.0

# 

# 2\. Create the local Secret manifest

# 

# The real kubernetes/secret.yaml file is intentionally ignored by Git. Createit from the safe example before deployment.

# 

# Windows PowerShell:

# 

# Copy-Item kubernetes\\secret.example.yaml kubernetes\\secret.yaml

# 

# Linux or macOS:

# 

# cp kubernetes/secret.example.yaml kubernetes/secret.yaml

# 

# Never commit real credentials or production connection strings.

# 

# 3\. Deploy the resources

# 

# kubectl apply -f kubernetes/namespace.yaml

# kubectl apply -f kubernetes/configmap.yaml

# kubectl apply -f kubernetes/secret.yaml

# kubectl apply -f kubernetes/mongodb-service.yaml

# kubectl apply -f kubernetes/mongodb-deployment.yaml

# kubectl apply -f kubernetes/product-service.yaml

# kubectl apply -f kubernetes/product-deployment.yaml

# 

# 4\. Verify the rollout

# 

# kubectl rollout status deployment/mongodb -n cafeflow --timeout=120s

# kubectl rollout status deployment/cafeflow-product-service -n cafeflow --timeout=180s

# kubectl get deployments,pods,services,configmaps,secrets -n cafeflow

# 

# Expected deployment state:

# 

# Product service Deployment: 2/2 available replicas

# 

# MongoDB Deployment: 1/1 available replica

# 

# Three pods in Running and Ready state

# 

# Two ClusterIP Services

# 

# One application ConfigMap and one application Secret

# 

# 5\. Access the Kubernetes service

# 

# kubectl port-forward service/cafeflow-product-service 4000:4000 -n cafeflow

# 

# In another terminal:

# 

# Invoke-RestMethod http://localhost:4000/health/ready |

# &#x20;   ConvertTo-Json -Depth 5

# 

# Expected status:

# 

# {

# &#x20; "status": "READY",

# &#x20; "dependencies": {

# &#x20;   "mongodb": "UP"

# &#x20; }

# }

# 

# Delete the local learning deployment when it is no longer needed:

# 

# kubectl delete namespace cafeflow

# 

# Deleting the namespace also deletes the learning MongoDB pod and itsemptyDir data.

# 

# Configuration

# 

# Variable

# 

# Purpose

# 

# Default

# 

# NODE\_ENV

# 

# Runtime environment

# 

# development

# 

# PORT

# 

# HTTP port

# 

# 4000

# 

# MONGO\_URI

# 

# MongoDB connection string

# 

# Local CafeFlow database

# 

# CORS\_ORIGIN

# 

# Allowed client origin

# 

# \*

# 

# GRAPHQL\_INTROSPECTION

# 

# Enable GraphQL schema introspection

# 

# true

# 

# LOG\_LEVEL

# 

# Minimum structured-log level

# 

# info

# 

# LOW\_STOCK\_THRESHOLD

# 

# Maximum quantity treated as low stock

# 

# 5

# 

# Verified results

# 

# Verified locally on 29 July 2026 using Windows, Docker Desktop and DockerDesktop Kubernetes:

# 

# Docker Compose started MongoDB and the product service successfully.

# 

# Both Docker containers reached healthy status.

# 

# Kubernetes deployed two product-service replicas and one MongoDB replica.

# 

# All three Kubernetes pods reached Running and Ready status with zerorestarts.

# 

# ConfigMap, Secret and two ClusterIP Services were created successfully.

# 

# The readiness endpoint returned READY with MongoDB reported as UP.

# 

# All 39 automated tests passed.

# 

# Line coverage reached 96.35% across the tested modules.

# 

# Detailed verification evidence is recorded inVERIFICATION.md.

# 

# Resume description

# 

# CafeFlow – Cloud-Native Product Catalog ServiceNode.js, Express.js, GraphQL, Apollo Server, MongoDB, Mongoose, Docker,Kubernetes, Vitest

# 

# Developed a GraphQL product-catalog service supporting CRUD, pagination,sorting, search, category filtering and computed inventory-status operations.

# 

# Designed MongoDB schemas with validation and unique SKU enforcement, withconsistent errors for invalid, conflicting and missing resources.

# 

# Containerized the application and MongoDB using Docker Compose with healthchecks and a non-root application container.

# 

# Deployed the service on Kubernetes with two application replicas, ClusterIPServices, ConfigMap, Secret, resource limits, and liveness and readinessprobes.

# 

# Implemented 39 automated tests, achieving 96.35% line coverage, 90.07%branch coverage and 100% function coverage across the tested modules.

# 

# Project boundary

# 

# categoryId is an external category reference. This repository contains onecomplete product service, not a claimed multi-service platform. It can laterbe integrated with a category service without changing the current projectdescription.

# 

# License

# 

# This project is available under the MIT License.


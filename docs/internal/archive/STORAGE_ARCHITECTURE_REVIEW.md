# Storage Architecture Review

Status: Review only. No implementation changes.

## 1) Local Storage
Use case:
- Local development and low-risk environments.

Strengths:
- Simple setup
- Fast feedback loop

Risks:
- Not horizontally scalable
- Host-bound persistence risk

Decision:
- Keep for development only.

## 2) AWS S3
Use case:
- Primary production object storage.

Strengths:
- High durability
- Lifecycle policy support
- Fine-grained IAM

Gaps to close before feature implementation:
- Bucket naming and environment strategy
- Key namespace convention per tenant and module
- Upload antivirus and content scanning policy

## 3) Resume Storage
Requirements:
- Tenant-isolated key namespace
- Allowed mime type enforcement
- Virus scanning and retention policy

Recommendation:
- key pattern: tenantId/candidates/candidateId/resumes/version/file

## 4) Document Storage
Coverage:
- Candidate documents, contracts, templates, operational attachments.

Gaps:
- Missing document class policy map (PII, confidential, public)
- Missing retention and legal hold policy alignment

## 5) Invoice Storage
Requirements:
- Immutable archive-friendly objects
- Long retention
- Access controlled by tenant and role

Recommendation:
- Write-once style strategy with strict audit trail.

## 6) Security
Mandatory controls:
- Signed URLs with short TTL
- Server-side encryption
- Principle of least privilege IAM
- Content-type and size validation
- Tenant-aware object path validation

Gaps:
- No finalized threat model document yet.

## 7) Lifecycle Policies
Recommended policy bands:
- Hot: 0-90 days
- Warm: 90-365 days
- Archive: 1 year plus based on compliance

## 8) Future Scalability
Recommendations:
- CDN for static brand assets
- Async processing pipeline for large uploads
- Region strategy for data residency requirements

## Storage Review Verdict
- Architecture direction is acceptable.
- Approval should require finalization of key namespace policy, retention matrix, and tenant IAM policy template.

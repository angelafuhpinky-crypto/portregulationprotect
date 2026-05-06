# Port Violation System Security Specification

## 1. Data Invariants
- `ViolationRecord` must belong to a valid `Company`.
- `year` in `ViolationRecord` must match the year part of the `date` string.
- `points` is usually 1, but if `isCancelled` is true, it shouldn't count towards the annual total in UI (though it remains in DB).
- `SuspensionRecord` must have `endDate` >= `startDate`.
- Only authenticated users can read or write.

## 2. The Dirty Dozen Payloads (Targeting Vulnerabilities)
1. **Self-Assignment**: Attempting to create a violation record for a company the user doesn't have permission to manage (though here we assume a central admin model).
2. **Identity Spoofing**: Setting `companyId` to a non-existent company.
3. **Shadow Fields**: Adding an `isVip` field to a company.
4. **Invalid Date**: Setting `date` to "9999-99-99".
5. **Future Date**: Setting `createdAt` to a future time from the client.
6. **Point Injection**: Setting `points` to 100 for a minor violation.
7. **Bypassing Cancellation Checks**: Setting `isCancelled` to true without providing an appeal document.
8. **Suspension Overlap**: Creating multiple active suspensions for the same company (client logic check, rules can't easily prevent O(n) lookups but can check basic sanity).
9. **Doc Number Overflow**: Setting `docNumber` to a 1MB string.
10. **Tax ID Injection**: Setting `taxId` to a script tag.
11. **Illegal Year**: Setting `date` to "2023-01-01" but `year` to 2024.
12. **Unauthorized Deletion**: A non-admin trying to delete a company with historical records.

## 3. Threat Model
The system is managed by port authority staff. All users are expected to be staff, so the primary risk is "Privilege Escalation" (if we had different roles) or "Data Corruption" (accidental or malicious).
Since no specific roles were mentioned, I'll assume all authenticated users are "authorized staff" but still enforce strict schema validation.

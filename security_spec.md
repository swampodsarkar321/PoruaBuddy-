# Security Specification: SRS Web Studio

## 1. Data Invariants
1. Only authenticated users with matching `userId` or verified admin accounts can view customer orders.
2. Only administrators can alter `paymentStatus` on orders (e.g. from 'Payment Under Review' to 'Paid').
3. Customers can never self-assign admin roles or write to the `/admins` collection.
4. Products can only be created, modified, or deleted by administrators.
5. Inquiries can be submitted by users, but only read/updated by administrators.
6. Site settings (bKash, Nagad payment details) can be viewed publicly but modified exclusively by administrators.
7. Public users may only read published products (`isPublished == true`).

## 2. Dirty Dozen Threat Payloads
1. **Ghost Admin Assignment**: User registering with `role: "admin"` directly in `users/{uid}`. (Blocked: role must be "customer" or rejected).
2. **Payment Self-Verification**: Customer setting `paymentStatus: "Paid"` when submitting an order. (Blocked: initial order status MUST be 'Awaiting Payment' or 'Payment Under Review').
3. **Price Tampering**: Customer updating the product catalog price to ৳1. (Blocked: non-admins cannot update products).
4. **Order Interception**: Customer reading another customer's order ID. (Blocked: `resource.data.userId == request.auth.uid` or admin).
5. **Admin List Injection**: Malicious write to `/admins/{uid}`. (Blocked: write to `/admins` is forbidden or strictly restricted).
6. **Denial of Wallet Payload**: 500KB string payload in product review or inquiry message. (Blocked: message string size bounded <= 2000 chars).
7. **Negative Order Price**: Submitting totalAmountBDT < 0. (Blocked: totalAmountBDT must be >= 0).
8. **Invalid ID Poisoning**: Document path with non-alphanumeric special characters. (Blocked: `isValidId(docId)`).
9. **License Key Leak**: Unauthenticated user reading protected digital delivery keys before payment is confirmed. (Blocked: order license keys gated to verified paid orders and admin).
10. **Timestamp Forgery**: Submitting future or past client timestamp. (Blocked: `createdAt == request.time`).
11. **Site Settings Hijack**: Malicious user updating merchant bKash number to their personal number. (Blocked: only admin can update siteSettings).
12. **Inquiry Sniffing**: Non-admin user querying another person's inquiry data. (Blocked: inquiry reads restricted to admin).

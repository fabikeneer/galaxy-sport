# Galaxy Sport - Project Blueprint

## Project Structure
The project follows a modular structure separated into frontend and backend. Currently, this blueprint focuses on the backend implementation.

```text
galaxy-sport/
├── backend/
│   ├── config/          # Configuration files (DB, env vars)
│   ├── controllers/     # Route handlers logic
│   ├── middlewares/     # Custom express middlewares (auth, upload, etc.)
│   ├── models/          # Database interaction logic
│   ├── routes/          # Express route definitions
│   └── server.js        # Main application entry point
├── PROJECT_BLUEPRINT.md # Project documentation
└── package.json         # Node.js dependencies and scripts
```

## Global Rules
*   **Code Language:** All code (variable names, function names, comments within the code, database tables/columns) must be written in **English**.
*   **Response Language:** All user-facing text, error messages returned by the API, and documentation intended for the end user must be in **Spanish**.
*   **Error Handling:** All asynchronous operations and route handlers must use `try/catch` blocks for robust error handling.

## Business Logic

### Order States (Status)
Orders will transition through the following states:
1.  `pending`: Order created, waiting for payment confirmation.
2.  `paid_to_verify`: Payment received (e.g., receipt uploaded), pending admin verification.
3.  `completed`: Payment verified and order fulfilled.
4.  `cancelled`: Order cancelled due to non-payment, user request, or other reasons.

### Inventory Control (Variants)
Stock is NOT controlled at the product level. Instead, stock is strictly managed at the `product_variants` level. 
A product (e.g., "Real Madrid Home Jersey") acts as a container. Its variants specify the exact model (if applicable) and size (e.g., Model: Home, Size: L).
The available quantity for purchase is determined solely by the `stock` field within the corresponding variant. When an order is completed, the stock must be deducted from the specific variant, not the general product.

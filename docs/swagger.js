const swaggerSpec = {
  openapi: "3.0.3",

  info: {
    title: "Booking Management API",
    version: "1.0.0",
    description: "Booking Management API Documentation",
  },

  servers: [
    {
      url: "http://localhost:5002",
      description: "Local Server",
    },
    // {
    //   url: "https://bookingmanagementservices.onrender.com",
    //   description: "Production Server",
    // },
    // {
    //   url: "https://api.devankit.co.in",
    //   description: "Production Server",
    // },
  ],


  tags: [
    { name: "Authentication" },
    { name: "Customer Booking" },
    { name: "Admin Booking" },
    { name: "Admin Test Management" },
    { name: "Common APIs" },
  ],

  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: { type: "string", example: "Ankit" },
          email: { type: "string", example: "ankit@example.com" },
          password: { type: "string", example: "123456" },
          role: {
            type: "string",
            enum: ["admin", "customer"],
            example: "customer",
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "ankit@example.com" },
          password: { type: "string", example: "123456" },
        },
      },

      // UPDATED BOOKING REQUEST
      BookingRequest: {
        type: "object",
        anyOf: [{ required: ["testId"] }, { required: ["testName"] }],
        required: [
          "patientName",
          "age",
          "gender",
          "phone",
          "email",
          "bookingDate",
          "timeSlotId",
          "addressId",
        ],
        properties: {
          patientName: { type: "string", example: "Rahul Sharma" },
          testName: { type: "string", example: "Blood Test" },
          testId: {
            type: "string",
            example: "6af1a0ea1db09f05854d81ed",
            description: "Selected active test catalog MongoDB ID",
          },
          amount: {
            type: "number",
            example: 500,
            readOnly: true,
            description: "Price copied from the active test catalog entry",
          },
          age: { type: "integer", example: 25 },
          gender: {
            type: "string",
            enum: ["Male", "Female", "Other"],
            example: "Male",
          },
          phone: { type: "string", example: "9876543210" },
          email: { type: "string", example: "rahul@example.com" },
          bookingDate: {
            type: "string",
            format: "date",
            example: "2026-11-10",
          },
          timeSlotId: {
            type: "string",
            example: "672abc123456789012345678",
            description: "Selected Time Slot MongoDB ID",
          },
          addressId: {
            type: "string",
            example: "672def123456789012345678",
            description: "Selected Customer Address MongoDB ID",
          },
          notes: { type: "string", example: "Fasting required" },
        },
      },

      // CUSTOMER BOOKING UPDATE REQUEST
      BookingUpdateRequest: {
        type: "object",
        properties: {
          patientName: {
            type: "string",
            example: "Rahul Sharma",
          },
          testName: {
            type: "string",
            example: "Blood Test",
          },
          age: {
            type: "integer",
            example: 25,
          },
          gender: {
            type: "string",
            enum: ["Male", "Female", "Other"],
            example: "Male",
          },
          phone: {
            type: "string",
            example: "9876543210",
          },
          email: {
            type: "string",
            example: "rahul@example.com",
          },
          notes: {
            type: "string",
            example: "Fasting required",
          },
        },
      },
    },
  },

  paths: {
    // =========================================
    // AUTHENTICATION APIs
    // =========================================

    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register Admin or Customer",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },

        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
          409: { description: "User already exists" },
          500: { description: "Internal server error" },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login Admin or Customer",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },

        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
          500: { description: "Internal server error" },
        },
      },
    },

    // =========================================
    // CUSTOMER BOOKING APIs
    // =========================================

    "/api/customer/bookings": {
      post: {
        tags: ["Customer Booking"],
        summary: "Create Booking",
        security: [{ BearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BookingRequest",
              },
            },
          },
        },

        responses: {
          201: { description: "Booking created successfully" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          404: { description: "Address not found" },
          409: { description: "Time slot unavailable or fully booked" },
          500: { description: "Internal server error" },
        },
      },

      get: {
        tags: ["Customer Booking"],
        summary: "Get Customer Bookings",
        security: [{ BearerAuth: [] }],

        responses: {
          200: { description: "Bookings fetched successfully" },
          401: { description: "Unauthorized" },
          500: { description: "Internal server error" },
        },
      },
    },

    "/api/customer/bookings/{id}": {
      get: {
        tags: ["Customer Booking"],
        summary: "Get Booking By ID",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],

        responses: {
          200: { description: "Booking fetched successfully" },
          404: { description: "Booking not found" },
          401: { description: "Unauthorized" },
        },
      },

      put: {
        tags: ["Customer Booking"],
        summary: "Update Booking",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BookingUpdateRequest",
              },
            },
          },
        },

        responses: {
          200: { description: "Booking updated successfully" },
          404: { description: "Booking not found" },
          401: { description: "Unauthorized" },
        },
      },

      delete: {
        tags: ["Customer Booking"],
        summary: "Delete Booking",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],

        responses: {
          200: { description: "Booking deleted successfully" },
          404: { description: "Booking not found" },
          401: { description: "Unauthorized" },
        },
      },
    },

    // =========================================
    // ADMIN BOOKING APIs
    // =========================================

    "/api/admin/bookings": {
      get: {
        tags: ["Admin Booking"],
        summary: "Get All Customer Bookings",
        description: "Admin can view all customer bookings",
        security: [{ BearerAuth: [] }],

        responses: {
          200: { description: "All bookings fetched successfully" },
          401: { description: "Unauthorized - Token required" },
          403: { description: "Admin access required" },
          500: { description: "Internal server error" },
        },
      },
    },

    "/api/admin/bookings/{id}": {
      get: {
        tags: ["Admin Booking"],
        summary: "Get Single Booking Details",
        description: "Admin can view any customer's booking details",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "672a12345678901234567890",
            },
          },
        ],

        responses: {
          200: { description: "Booking fetched successfully" },
          400: { description: "Invalid booking ID" },
          401: { description: "Token required" },
          403: { description: "Admin access required" },
          404: { description: "Booking not found" },
          500: { description: "Internal server error" },
        },
      },

      put: {
        tags: ["Admin Booking"],
        summary: "Update Booking Details",
        description: "Admin can update existing customer booking details",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "672a12345678901234567890",
            },
            description: "Booking ID",
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  patientName: {
                    type: "string",
                    example: "Rahul Sharma",
                  },
                  testName: {
                    type: "string",
                    example: "Blood Test",
                  },
                  age: {
                    type: "number",
                    example: 25,
                  },
                  gender: {
                    type: "string",
                    example: "Male",
                  },
                  phone: {
                    type: "string",
                    example: "9876543210",
                  },
                  email: {
                    type: "string",
                    example: "rahul@example.com",
                  },
                  bookingDate: {
                    type: "string",
                    format: "date",
                    example: "2026-11-10",
                  },
                  timeSlot: {
                    type: "string",
                    example: "10:00 AM - 11:00 AM",
                  },
                  notes: {
                    type: "string",
                    example: "Fasting required",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: { description: "Booking updated successfully" },
          400: { description: "Invalid booking ID or update data" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
          404: { description: "Booking not found" },
          500: { description: "Internal server error" },
        },
      },

      delete: {
        tags: ["Admin Booking"],
        summary: "Delete Booking",
        description: "Admin can delete any customer's booking",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "672a12345678901234567890",
            },
            description: "Booking ID",
          },
        ],

        responses: {
          200: { description: "Booking deleted successfully" },
          400: { description: "Invalid booking ID" },
          401: { description: "Token required" },
          403: { description: "Admin access required" },
          404: { description: "Booking not found" },
          500: { description: "Internal server error" },
        },
      },
    },

    "/api/admin/bookings/{id}/status": {
      put: {
        tags: ["Admin Booking"],
        summary: "Update Booking Status",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["pending", "confirmed", "completed", "cancelled"],
                    example: "confirmed",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: { description: "Booking status updated successfully" },
          400: { description: "Invalid ID or status" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
          404: { description: "Booking not found" },
          500: { description: "Internal server error" },
        },
      },
    },

    // =========================================
    // ADMIN TEST MANAGEMENT APIs
    // =========================================

    "/api/admin/tests": {
      // CREATE TEST
      post: {
        tags: ["Admin Test Management"],
        summary: "Create Test",
        description: "Admin can create a new medical test",
        security: [{ BearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["testName", "price", "duration"],
                properties: {
                  testName: {
                    type: "string",
                    example: "Complete Blood Count (CBC)",
                  },
                  description: {
                    type: "string",
                    example: "Blood test to check overall health",
                  },
                  imageUrl: {
                    type: "string",
                    example: "https://example.com/images/cbc-test.png",
                    description: "Medical test image URL",
                  },
                  price: {
                    type: "number",
                    example: 500,
                  },
                  preparationInstructions: {
                    type: "string",
                    example: "No fasting required",
                  },
                  duration: {
                    type: "string",
                    example: "24 hours",
                  },
                  isActive: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        },

        responses: {
          201: { description: "Test created successfully" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },

      // GET ALL TESTS
      get: {
        tags: ["Admin Test Management"],
        summary: "Get All Tests",
        description:
          "Admin can view all medical tests including active and inactive tests",
        security: [{ BearerAuth: [] }],

        responses: {
          200: {
            description: "All tests fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    total: {
                      type: "number",
                      example: 2,
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "672a12345678901234567890",
                          },
                          testName: {
                            type: "string",
                            example: "Complete Blood Count (CBC)",
                          },
                          description: {
                            type: "string",
                            example: "Blood test to check overall health",
                          },
                          imageUrl: {
                            type: "string",
                            example: "https://example.com/images/cbc-test.png",
                          },
                          price: {
                            type: "number",
                            example: 500,
                          },
                          preparationInstructions: {
                            type: "string",
                            example: "No fasting required",
                          },
                          duration: {
                            type: "string",
                            example: "24 hours",
                          },
                          isActive: {
                            type: "boolean",
                            example: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Token required" },
          403: { description: "Admin access required" },
          500: { description: "Internal server error" },
        },
      },
    },

    "/api/admin/tests/{id}": {
      // GET SINGLE TEST
      get: {
        tags: ["Admin Test Management"],
        summary: "Get Single Test",
        description: "Admin can view test details by ID",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "672a12345678901234567890",
            },
            description: "Test ID",
          },
        ],

        responses: {
          200: { description: "Test fetched successfully" },
          400: { description: "Invalid test ID" },
          401: { description: "Token required" },
          403: { description: "Admin access required" },
          404: { description: "Test not found" },
          500: { description: "Internal server error" },
        },
      },

      // UPDATE TEST
      put: {
        tags: ["Admin Test Management"],
        summary: "Update Test",
        description: "Admin can update existing test details",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "672a12345678901234567890",
            },
            description: "Test ID",
          },
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  testName: {
                    type: "string",
                    example: "Complete Blood Count",
                  },
                  description: {
                    type: "string",
                    example: "Updated blood test description",
                  },
                  imageUrl: {
                    type: "string",
                    example: "https://example.com/images/updated-cbc.png",
                    description: "Updated medical test image URL",
                  },
                  price: {
                    type: "number",
                    example: 600,
                  },
                  preparationInstructions: {
                    type: "string",
                    example: "Fasting required for 8 hours",
                  },
                  duration: {
                    type: "string",
                    example: "12 hours",
                  },
                  isActive: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        },

        responses: {
          200: { description: "Test updated successfully" },
          400: { description: "Invalid test ID or update data" },
          401: { description: "Token required" },
          403: { description: "Admin access required" },
          404: { description: "Test not found" },
          500: { description: "Internal server error" },
        },
      },

      // DELETE TEST
      delete: {
        tags: ["Admin Test Management"],
        summary: "Delete Test",
        description: "Admin can delete a medical test",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "672a12345678901234567890",
            },
            description: "Test ID",
          },
        ],

        responses: {
          200: { description: "Test deleted successfully" },
          400: { description: "Invalid test ID" },
          401: { description: "Token required" },
          403: { description: "Admin access required" },
          404: { description: "Test not found" },
          500: { description: "Internal server error" },
        },
      },
    },

    // =========================================
    // CUSTOMER TEST MANAGEMENT APIs
    // =========================================

    "/api/customer/tests": {
      get: {
        tags: ["Customer Test"],
        summary: "Get All Active Tests",
        operationId: "getCustomerTests",
        description: "Get all active tests for logged-in customer",

        security: [{ BearerAuth: [] }],

        responses: {
          200: {
            description: "Active tests fetched successfully",
          },
          401: {
            description: "Unauthorized - Token required",
          },
          403: {
            description: "Forbidden - Customer access required",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    "/api/customer/tests/{id}": {
      get: {
        tags: ["Customer Test"],
        summary: "Get Test Details",
        operationId: "getCustomerTestById",
        description: "Get single active test details by ID",

        security: [{ BearerAuth: [] }],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "string",
            },
            description: "Test MongoDB ID",
          },
        ],

        responses: {
          200: {
            description: "Test details fetched successfully",
          },
          400: {
            description: "Invalid test ID",
          },
          401: {
            description: "Unauthorized - Token required",
          },
          403: {
            description: "Forbidden - Customer access required",
          },
          404: {
            description: "Test not found or inactive",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    // =========================================

    // COMMON FILE UPLOAD API
    // =========================================

    "/api/common/upload": {
      post: {
        tags: ["Common APIs"],
        summary: "Upload Image or PDF",
        description:
          "Common API to upload images and PDF files for Admin and Customer",

        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description:
                      "Upload JPG, JPEG, PNG, WEBP or PDF (Maximum 5 MB)",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "File uploaded successfully",
          },

          400: {
            description: "Invalid file or file size exceeded",
          },
          401: {
            description: "Token required",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    // =========================================
    // PAYMENT APIs
    // =========================================

    "/api/customer/payments/create-order": {
      post: {
        tags: ["Customer Payment"],
        summary: "Create Razorpay Order",
        operationId: "createPaymentOrder",
        description: "Create a Razorpay order for a customer booking",
        security: [{ BearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["bookingId"],
                properties: {
                  bookingId: {
                    type: "string",
                    example: "672abc123456789012345678",
                  },
                },
              },
            },
          },
        },

        responses: {
          201: {
            description: "Razorpay order created successfully",
          },
          400: {
            description: "Invalid booking ID or booking amount",
          },
          401: {
            description: "Unauthorized - Token required",
          },
          403: {
            description: "Customer access required",
          },
          404: {
            description: "Booking not found",
          },
          409: {
            description: "Booking already paid",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    "/api/customer/payments/verify": {
      post: {
        tags: ["Customer Payment"],
        summary: "Verify Payment",
        operationId: "verifyPayment",
        description: "Verify Razorpay payment signature and captured payment",
        security: [{ BearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "razorpay_order_id",
                  "razorpay_payment_id",
                  "razorpay_signature",
                ],
                properties: {
                  razorpay_order_id: {
                    type: "string",
                    example: "order_example123",
                  },
                  razorpay_payment_id: {
                    type: "string",
                    example: "pay_example123",
                  },
                  razorpay_signature: {
                    type: "string",
                    example: "signature_example123",
                  },
                },
              },
            },
          },
        },

        responses: {
          200: {
            description: "Payment verified successfully",
          },
          400: {
            description: "Invalid signature or payment not captured",
          },
          401: {
            description: "Unauthorized - Token required",
          },
          403: {
            description: "Customer access required",
          },
          404: {
            description: "Payment order not found",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    "/api/customer/payments/{id}": {
      get: {
        tags: ["Customer Payment"],
        summary: "Get Payment Details",
        operationId: "getPaymentDetails",
        description: "Get payment details by payment ID",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "string",
            },
            description: "MongoDB Payment ID",
            example: "672abc123456789012345678",
          },
        ],

        responses: {
          200: {
            description: "Payment details fetched successfully",
          },
          400: {
            description: "Invalid payment ID",
          },
          401: {
            description: "Unauthorized - Token required",
          },
          403: {
            description: "Customer access required",
          },
          404: {
            description: "Payment not found",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },

    // =========================================
    // TIME SLOT APIs
    // =========================================

    "/api/admin/time-slots": {
      post: {
        tags: ["Admin Time Slot"],
        summary: "Create Time Slot",
        operationId: "createTimeSlot",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["date", "startTime", "endTime", "capacity"],
                properties: {
                  date: { type: "string", example: "2026-11-15" },
                  startTime: { type: "string", example: "10:00" },
                  endTime: { type: "string", example: "10:30" },
                  capacity: { type: "integer", example: 5 },
                  isActive: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Time slot created successfully" },
          400: { description: "Invalid input" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
          409: { description: "Time slot already exists" },
        },
      },
      get: {
        tags: ["Admin Time Slot"],
        summary: "Get All Time Slots",
        operationId: "getAllTimeSlots",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "date",
            required: false,
            schema: { type: "string", example: "2026-11-15" },
          },
        ],
        responses: {
          200: { description: "Time slots fetched successfully" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },

    "/api/admin/time-slots/{id}": {
      get: {
        tags: ["Admin Time Slot"],
        summary: "Get Time Slot By ID",
        operationId: "getTimeSlotById",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Time slot details fetched successfully" },
          400: { description: "Invalid time slot ID" },
          404: { description: "Time slot not found" },
        },
      },
      put: {
        tags: ["Admin Time Slot"],
        summary: "Update Time Slot",
        operationId: "updateTimeSlot",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  date: { type: "string", example: "2026-11-15" },
                  startTime: { type: "string", example: "10:30" },
                  endTime: { type: "string", example: "11:00" },
                  capacity: { type: "integer", example: 6 },
                  isActive: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Time slot updated successfully" },
          400: { description: "Invalid input or capacity" },
          404: { description: "Time slot not found" },
        },
      },
      delete: {
        tags: ["Admin Time Slot"],
        summary: "Delete Time Slot",
        operationId: "deleteTimeSlot",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Time slot deleted successfully" },
          400: { description: "Slot already has bookings" },
          404: { description: "Time slot not found" },
        },
      },
    },

    // ================= CUSTOMER TIME SLOT APIs =================

    "/api/customer/time-slots": {
      get: {
        tags: ["Customer Time Slot"],
        summary: "Get Available Time Slots",
        operationId: "getAvailableTimeSlots",
        description:
          "Get all active time slots with available seats for a selected date.",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            in: "query",
            name: "date",
            required: true,
            description: "Booking date in YYYY-MM-DD format",
            schema: {
              type: "string",
              example: "2026-11-15",
            },
          },
        ],

        responses: {
          200: {
            description: "Available time slots fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    total: {
                      type: "integer",
                      example: 2,
                    },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string",
                            example: "672abc123456789012345678",
                          },
                          date: {
                            type: "string",
                            example: "2026-11-15",
                          },
                          startTime: {
                            type: "string",
                            example: "10:00",
                          },
                          endTime: {
                            type: "string",
                            example: "10:30",
                          },
                          capacity: {
                            type: "integer",
                            example: 5,
                          },
                          bookedCount: {
                            type: "integer",
                            example: 2,
                          },
                          availableSeats: {
                            type: "integer",
                            example: 3,
                          },
                          isActive: {
                            type: "boolean",
                            example: true,
                          },
                          isAvailable: {
                            type: "boolean",
                            example: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          400: {
            description: "Invalid or missing date",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden - Customer access only",
          },
        },
      },
    },

    "/api/customer/time-slots/{id}": {
      get: {
        tags: ["Customer Time Slot"],
        summary: "Get Available Time Slot By ID",
        operationId: "getAvailableTimeSlotById",
        description: "Get details of a particular available time slot.",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            description: "MongoDB Time Slot ID",
            schema: {
              type: "string",
              example: "672abc123456789012345678",
            },
          },
        ],

        responses: {
          200: {
            description: "Time slot fetched successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      properties: {
                        _id: {
                          type: "string",
                        },
                        date: {
                          type: "string",
                          example: "2026-11-15",
                        },
                        startTime: {
                          type: "string",
                          example: "10:00",
                        },
                        endTime: {
                          type: "string",
                          example: "10:30",
                        },
                        capacity: {
                          type: "integer",
                          example: 5,
                        },
                        bookedCount: {
                          type: "integer",
                          example: 2,
                        },
                        availableSeats: {
                          type: "integer",
                          example: 3,
                        },
                        isActive: {
                          type: "boolean",
                          example: true,
                        },
                        isAvailable: {
                          type: "boolean",
                          example: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },

          400: {
            description: "Invalid time slot ID",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Forbidden - Customer access only",
          },
          404: {
            description: "Time slot not found or unavailable",
          },
        },
      },
    },

    // =========================================
    //address APIs
    // =========================================

    "/api/customer/addresses": {
      post: {
        tags: ["Customer Address"],
        summary: "Add Customer Address",
        description: "Customer can save a new address",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "fullName",
                  "phone",
                  "houseNo",
                  "street",
                  "city",
                  "state",
                  "pincode",
                ],
                properties: {
                  addressType: {
                    type: "string",
                    enum: ["Home", "Office", "Other"],
                    example: "Home",
                  },
                  fullName: {
                    type: "string",
                    example: "Ankit Kumar",
                  },
                  phone: {
                    type: "string",
                    example: "9876543210",
                  },
                  houseNo: {
                    type: "string",
                    example: "H-22",
                  },
                  street: {
                    type: "string",
                    example: "Sector 15",
                  },
                  landmark: {
                    type: "string",
                    example: "Near Metro Station",
                  },
                  city: {
                    type: "string",
                    example: "Faridabad",
                  },
                  state: {
                    type: "string",
                    example: "Haryana",
                  },
                  pincode: {
                    type: "string",
                    example: "121001",
                  },
                  latitude: {
                    type: "number",
                    example: 28.4089,
                  },
                  longitude: {
                    type: "number",
                    example: 77.3178,
                  },
                  isDefault: {
                    type: "boolean",
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Address added successfully" },
          400: { description: "Validation error" },
          401: { description: "Unauthorized" },
          403: { description: "Customer access required" },
        },
      },

      get: {
        tags: ["Customer Address"],
        summary: "Get All Saved Addresses",
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Addresses fetched successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/customer/addresses/{id}": {
      get: {
        tags: ["Customer Address"],
        summary: "Get Address By ID",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string",
              example: "672a12345678901234567890",
            },
          },
        ],
        responses: {
          200: { description: "Address fetched successfully" },
          400: { description: "Invalid address ID" },
          404: { description: "Address not found" },
        },
      },

      put: {
        tags: ["Customer Address"],
        summary: "Update Address",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  addressType: {
                    type: "string",
                    enum: ["Home", "Office", "Other"],
                  },
                  fullName: { type: "string" },
                  phone: { type: "string" },
                  houseNo: { type: "string" },
                  street: { type: "string" },
                  landmark: { type: "string" },
                  city: { type: "string" },
                  state: { type: "string" },
                  pincode: { type: "string" },
                  latitude: { type: "number" },
                  longitude: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Address updated successfully" },
          400: { description: "Invalid address ID or data" },
          404: { description: "Address not found" },
        },
      },

      delete: {
        tags: ["Customer Address"],
        summary: "Delete Address",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Address deleted successfully" },
          400: { description: "Invalid address ID" },
          404: { description: "Address not found" },
        },
      },
    },

    "/api/customer/addresses/{id}/default": {
      put: {
        tags: ["Customer Address"],
        summary: "Set Default Address",
        description: "Set a saved address as the customer's default address",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Default address updated successfully" },
          400: { description: "Invalid address ID" },
          404: { description: "Address not found" },
        },
      },
    },

    // =========================================
    // REPORT APIs
    // =========================================

    "/api/admin/reports/upload": {
    post: {
    tags: ["Admin Reports"],
    summary: "Add report URL to booking",
    description: "Admin adds a report URL against a booking ID.",
    security: [{ BearerAuth: [] }],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["bookingId", "fileUrl"],
            properties: {
              bookingId: {
                type: "string",
                example: "673a12345678901234567891",
              },
              fileUrl: {
                type: "string",
                format: "uri",
                example: "https://example.com/reports/blood-test-report.pdf",
              },
            },
          },
        },
      },
    },
    responses: {
      201: {
        description: "Report URL added successfully",
      },
      400: {
        description: "Invalid booking ID or file URL",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Admin access required",
      },
      404: {
        description: "Booking not found",
      },
    },
  },
    },

    "/api/admin/fetchAllReports": {
  get: {
    tags: ["Admin Reports"],
    summary: "Fetch all reports",
    description: "Admin can fetch all uploaded reports",
    security: [{ BearerAuth: [] }],
    responses: {
      200: {
        description: "All reports fetched successfully",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Admin access required",
      },
    },
  },
    },

    "/api/customer/reports": {
      get: {
        tags: ["Customer Reports"],
        summary: "Fetch reports for the authenticated customer",
        description: "Returns reports linked only to the authenticated customer's bookings.",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Customer reports fetched successfully",
          },
          401: {
            description: "Unauthorized",
          },
          403: {
            description: "Customer access required",
          },
        },
      },
    },
    
    "/api/admin/deleteReports/{reportId}": {
  delete: {
    tags: ["Admin Reports"],
    summary: "Delete report",
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        in: "path",
        name: "reportId",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    responses: {
      200: {
        description: "Report deleted successfully",
      },
      400: {
        description: "Invalid report ID",
      },
      401: {
        description: "Unauthorized",
      },
      403: {
        description: "Admin access required",
      },
      404: {
        description: "Report not found",
      },
    },
  },
},
  },
};

module.exports = swaggerSpec;

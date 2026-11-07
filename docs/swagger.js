const swaggerSpec = {
  openapi: "3.0.3",

  info: {
    title: "Booking Management API",
    version: "1.0.0",
    description: "Booking Management API Documentation",
  },

  servers: [
    // {
    //   url: "http://localhost:5002",
    //   description: "Local Server",
    // },
    {
      url: "https://bookingmanagementservices.onrender.com",
      description: "Production Server",
    },
  ],

  tags: [
    { name: "Authentication" },
    { name: "Customer Booking" },
    { name: "Admin Booking" },
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

      BookingRequest: {
        type: "object",
        required: [
          "patientName",
          "testName",
          "age",
          "gender",
          "phone",
          "bookingDate",
          "timeSlot",
        ],
        properties: {
          patientName: { type: "string", example: "Rahul Sharma" },
          testName: { type: "string", example: "Blood Test" },
          age: { type: "integer", example: 25 },
          gender: {
            type: "string",
            enum: ["male", "female", "other"],
            example: "male",
          },
          phone: { type: "string", example: "9876543210" },
          email: { type: "string", example: "rahul@example.com" },
          bookingDate: {
            type: "string",
            format: "date",
            example: "2026-11-10",
          },
          timeSlot: { type: "string", example: "10:00 AM" },
          notes: { type: "string", example: "Fasting required" },
        },
      },
    },
  },

  paths: {
    // AUTHENTICATION APIs

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

    // CUSTOMER BOOKING APIs

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
          401: { description: "Unauthorized" },
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
                $ref: "#/components/schemas/BookingRequest",
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

    // ADMIN BOOKING APIs

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
          200: {
            description: "Booking fetched successfully",
          },
          400: {
            description: "Invalid booking ID",
          },
          401: {
            description: "Token required",
          },
          403: {
            description: "Admin access required",
          },
          404: {
            description: "Booking not found",
          },
          500: {
            description: "Internal server error",
          },
        },
      },

      put: {
        tags: ["Admin Booking"],
        summary: "Update Booking Details",
        description: "Admin can update existing customer booking details",
        security: [{ BearerAuth: [] }],

        parameters: [
          {
            in: "path",
            name: "id",
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
          200: {
            description: "Booking updated successfully",
          },
          400: {
            description: "Invalid booking ID or update data",
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
          500: {
            description: "Internal server error",
          },
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
          200: {
            description: "Booking deleted successfully",
          },
          400: {
            description: "Invalid booking ID",
          },
          401: {
            description: "Token required",
          },
          403: {
            description: "Admin access required",
          },
          404: {
            description: "Booking not found",
          },
          500: {
            description: "Internal server error",
          },
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
    // ADMIN TEST MANAGEMENT APIs

"/api/admin/tests": {
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
            },
          },
        },
      },
    },

    responses: {
      201: {
        description: "Test created successfully",
      },
      400: {
        description: "Invalid test details",
      },
      401: {
        description: "Token required",
      },
      403: {
        description: "Admin access required",
      },
      500: {
        description: "Internal server error",
      },
    },
  },

  get: {
    tags: ["Admin Test Management"],
    summary: "Get All Tests",
    description: "Admin can view all medical tests",
    security: [{ BearerAuth: [] }],

    responses: {
      200: {
        description: "Tests fetched successfully",
      },
      401: {
        description: "Token required",
      },
      403: {
        description: "Admin access required",
      },
      500: {
        description: "Internal server error",
      },
    },
  },
},

"/api/admin/tests/{id}": {
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
      200: {
        description: "Test fetched successfully",
      },
      400: {
        description: "Invalid test ID",
      },
      401: {
        description: "Token required",
      },
      403: {
        description: "Admin access required",
      },
      404: {
        description: "Test not found",
      },
      500: {
        description: "Internal server error",
      },
    },
  },
},

    
  },
};

module.exports = swaggerSpec;

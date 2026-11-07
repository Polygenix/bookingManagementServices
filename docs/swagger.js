
const swaggerSpec = {
  openapi: "3.0.3",

    info: {
      title: "Booking Management API",
      version: "1.0.0",
      description: "Booking Management API Documentation"
    },

    servers: [
      {
        url: "http://localhost:5002",
        description: "Local Server"
      }
    ],

    tags: [
      { name: "Authentication" },
      { name: "Customer Booking" },
      { name: "Admin" }
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
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
              example: "customer"
            }
          }
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "ankit@example.com" },
            password: { type: "string", example: "123456" }
          }
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
            "timeSlot"
          ],
          properties: {
            patientName: { type: "string", example: "Rahul Sharma" },
            testName: { type: "string", example: "Blood Test" },
            age: { type: "integer", example: 25 },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              example: "male"
            },
            phone: { type: "string", example: "9876543210" },
            email: { type: "string", example: "rahul@example.com" },
            bookingDate: {
              type: "string",
              format: "date",
              example: "2026-11-10"
            },
            timeSlot: { type: "string", example: "10:00 AM" },
            notes: { type: "string", example: "Fasting required" }
          }
        }
      }
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
                  $ref: "#/components/schemas/RegisterRequest"
                }
              }
            }
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Validation error" },
            409: { description: "User already exists" },
            500: { description: "Internal server error" }
          }
        }
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
                  $ref: "#/components/schemas/LoginRequest"
                }
              }
            }
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
            500: { description: "Internal server error" }
          }
        }
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
                  $ref: "#/components/schemas/BookingRequest"
                }
              }
            }
          },
          responses: {
            201: { description: "Booking created successfully" },
            401: { description: "Unauthorized" },
            500: { description: "Internal server error" }
          }
        },

        get: {
          tags: ["Customer Booking"],
          summary: "Get Customer Bookings",
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "Bookings fetched successfully" },
            401: { description: "Unauthorized" },
            500: { description: "Internal server error" }
          }
        }
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
              schema: { type: "string" }
            }
          ],
          responses: {
            200: { description: "Booking fetched successfully" },
            404: { description: "Booking not found" },
            401: { description: "Unauthorized" }
          }
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
              schema: { type: "string" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BookingRequest"
                }
              }
            }
          },
          responses: {
            200: { description: "Booking updated successfully" },
            404: { description: "Booking not found" },
            401: { description: "Unauthorized" }
          }
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
              schema: { type: "string" }
            }
          ],
          responses: {
            200: { description: "Booking deleted successfully" },
            404: { description: "Booking not found" },
            401: { description: "Unauthorized" }
          }
        }
      },

      // ADMIN BOOKING APIs

      "/api/admin/bookings": {
        get: {
          tags: ["Admin"],
          summary: "Get All Customer Bookings",
          description: "Admin can view all customer bookings",
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: "All bookings fetched successfully"},
            401: { description: "Unauthorized - Token required" },
            403: { description: "Admin access required" },
            500: { description: "Internal server error" }
          }
        }
      }
    }
};

module.exports = swaggerSpec;

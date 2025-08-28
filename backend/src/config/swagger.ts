import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'RFP Management API',
            version: '1.0.0',
            description: 'API documentation for the RFP Management System',
        },
        servers: [
            {
                url: process.env.BACKEND_URL || 'http://localhost:3000/api/',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ],
        // Force security on all operations
        'x-defaultSecurity': [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/router/*.ts', './src/controllers/*.ts', './src/index.ts'],
};

const specs = swaggerJsdoc(options);

// Custom Swagger UI options
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestInterceptor: (request: any) => {
            console.log('Request intercepted:', request);
            
            // Check multiple possible localStorage keys that Swagger UI might use
            const possibleKeys = [
                'swagger-ui-auth',
                'swagger-ui:auth',
                'swaggerUIAuth',
                'authorized'
            ];
            
            let token = null;
            
            // Check all possible localStorage keys
            for (const key of possibleKeys) {
                try {
                    const authData = localStorage.getItem(key);
                    console.log(`Checking localStorage key "${key}":`, authData);
                    
                    if (authData) {
                        const parsed = JSON.parse(authData);
                        if (parsed.bearerAuth?.value || parsed.bearerAuth?.token) {
                            token = parsed.bearerAuth.value || parsed.bearerAuth.token;
                            console.log(`Found token in key "${key}":`, token);
                            break;
                        }
                    }
                } catch (e) {
                    console.log(`Error parsing key "${key}":`, e);
                }
            }
            
            // If no token found in localStorage, check sessionStorage
            if (!token) {
                for (const key of possibleKeys) {
                    try {
                        const authData = sessionStorage.getItem(key);
                        if (authData) {
                            const parsed = JSON.parse(authData);
                            if (parsed.bearerAuth?.value || parsed.bearerAuth?.token) {
                                token = parsed.bearerAuth.value || parsed.bearerAuth.token;
                                console.log(`Found token in sessionStorage key "${key}":`, token);
                                break;
                            }
                        }
                    } catch (e) {
                        // Ignore parsing errors
                    }
                }
            }
            
            // If we found a token, add it to headers
            if (token) {
                request.headers.Authorization = `Bearer ${token}`;
                console.log('Added Authorization header with token:', token.substring(0, 20) + '...');
            } else {
                console.log('No token found - you may need to authorize again');
                
                // Show all localStorage keys for debugging
                console.log('All localStorage keys:', Object.keys(localStorage));
                console.log('All sessionStorage keys:', Object.keys(sessionStorage));
            }
            
            console.log('Final request headers:', request.headers);
            return request;
        }
    },
    customCss: `
        .swagger-ui .auth-wrapper .authorize {
            color: #3b4151;
        }
    `
};

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
};
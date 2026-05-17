# File Upload and Storage API Documentation

## Overview

This document provides comprehensive documentation for the file upload and storage API endpoints. All file endpoints support local file storage with PostgreSQL metadata tracking, image resizing for product images, and digital product downloads.

---

## Base URL

```
http://localhost:3000/api/v1/files
```

---

## Authentication

Most file endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

### Public Endpoints
- `GET /files/:fileId/download` - Download file
- `GET /files/:fileId` - Get file details
- `GET /files/users/:userId/avatar` - Get user avatar
- `GET /files/products/:productId/images` - Get product images
- `GET /files/products/:productId/files` - Get product files

### Protected Endpoints (Require Authentication)
- `POST /files/avatar` - Upload user avatar
- `POST /files/products/:productId/images` - Upload product image
- `POST /files/products/:productId/files` - Upload product file
- `POST /files/courses/:courseId/materials` - Upload course material
- `DELETE /files/:fileId` - Delete file

---

## Endpoints

### 1. Upload User Avatar

**Endpoint:** `POST /files/avatar`

**Authentication:** Required (Bearer Token)

**Description:** Upload a user's profile avatar. The image is automatically resized to 400x400 pixels and converted to WebP format for optimization.

**Request:**
```
POST /api/v1/files/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

File: <image_file> (JPEG, PNG, or WebP)
```

**File Constraints:**
- Maximum size: 5MB
- Allowed types: JPEG, PNG, WebP
- Output format: WebP (400x400)
- Quality: 80%

**Successful Response (200):**
```json
{
  "message": "Avatar uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "uploads/avatars/user-123-abc-def.webp",
    "size": 15342
  }
}
```

**Error Response (400):**
```json
{
  "message": "File size exceeds maximum of 5MB",
  "error_code": "AVATAR_UPLOAD_FAILED"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/files/avatar \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@avatar.jpg"
```

---

### 2. Upload Product Image

**Endpoint:** `POST /files/products/{productId}/images`

**Authentication:** Required (Bearer Token)

**Description:** Upload an image for a product. The system automatically generates three optimized sizes: thumbnail (200x200), medium (600x600), and large (1200x1200). All images are converted to WebP format.

**Request:**
```
POST /api/v1/files/products/{productId}/images
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

File: <image_file> (JPEG, PNG, or WebP)
```

**URL Parameters:**
- `productId` (string, UUID) - The ID of the product

**File Constraints:**
- Maximum size: 10MB
- Allowed types: JPEG, PNG, WebP
- Output format: WebP (3 sizes)
- Quality: 80%

**Image Sizes Generated:**
- Thumbnail: 200x200px
- Medium: 600x600px
- Large: 1200x1200px

**Successful Response (200):**
```json
{
  "message": "Product image uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "images": {
      "thumbnail": {
        "filename": "product-123-abc-def-thumbnail.webp",
        "url": "uploads/products/product-123-abc-def-thumbnail.webp",
        "size": 5234,
        "width": 200,
        "height": 200
      },
      "medium": {
        "filename": "product-123-abc-def-medium.webp",
        "url": "uploads/products/product-123-abc-def-medium.webp",
        "size": 18234,
        "width": 600,
        "height": 600
      },
      "large": {
        "filename": "product-123-abc-def-large.webp",
        "url": "uploads/products/product-123-abc-def-large.webp",
        "size": 52341,
        "width": 1200,
        "height": 1200
      }
    }
  }
}
```

**Error Response (400):**
```json
{
  "message": "File type not allowed. Allowed types: image/jpeg, image/png, image/webp",
  "error_code": "PRODUCT_IMAGE_UPLOAD_FAILED"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/files/products/550e8400-e29b-41d4-a716-446655440000/images \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@product-image.jpg"
```

---

### 3. Upload Product File

**Endpoint:** `POST /files/products/{productId}/files`

**Authentication:** Required (Bearer Token)

**Description:** Upload a digital product file. Supports large files for downloadable content.

**Request:**
```
POST /api/v1/files/products/{productId}/files
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

File: <any_file>
```

**URL Parameters:**
- `productId` (string, UUID) - The ID of the product

**File Constraints:**
- Maximum size: 1GB
- Allowed types: All types supported
- Storage: Local filesystem with metadata tracking

**Successful Response (200):**
```json
{
  "message": "Product file uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "url": "uploads/products/product-123-abc-def-original.pdf",
    "size": 2048576,
    "filename": "course-materials.pdf"
  }
}
```

**Error Response (400):**
```json
{
  "message": "File size exceeds maximum of 1GB",
  "error_code": "PRODUCT_FILE_UPLOAD_FAILED"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/files/products/550e8400-e29b-41d4-a716-446655440000/files \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@product-file.zip"
```

---

### 4. Upload Course Material

**Endpoint:** `POST /files/courses/{courseId}/materials`

**Authentication:** Required (Bearer Token)

**Description:** Upload educational materials for a course.

**Request:**
```
POST /api/v1/files/courses/{courseId}/materials
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

File: <file>
```

**URL Parameters:**
- `courseId` (string, UUID) - The ID of the course

**File Constraints:**
- Maximum size: 500MB
- Allowed types: All types supported
- Storage: Local filesystem with metadata tracking

**Successful Response (200):**
```json
{
  "message": "Course material uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "url": "uploads/courses/course-123-abc-def-lecture.pdf",
    "size": 1024576,
    "filename": "lesson-1-lecture.pdf"
  }
}
```

**Error Response (400):**
```json
{
  "message": "File size exceeds maximum of 500MB",
  "error_code": "COURSE_MATERIAL_UPLOAD_FAILED"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/v1/files/courses/550e8400-e29b-41d4-a716-446655440000/materials \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@lecture-slides.pdf"
```

---

### 5. Download File

**Endpoint:** `GET /files/{fileId}/download`

**Authentication:** Not required

**Description:** Download a file. Increments the download count in the database.

**Request:**
```
GET /api/v1/files/550e8400-e29b-41d4-a716-446655440000/download
```

**URL Parameters:**
- `fileId` (string, UUID) - The ID of the file to download

**Response:**
- Returns file content as a binary stream
- Filename from database
- Content-Type based on mime_type

**cURL Example:**
```bash
curl -O -J http://localhost:3000/api/v1/files/550e8400-e29b-41d4-a716-446655440000/download
```

---

### 6. Get File Details

**Endpoint:** `GET /files/{fileId}`

**Authentication:** Not required

**Description:** Retrieve file metadata and details.

**Request:**
```
GET /api/v1/files/550e8400-e29b-41d4-a716-446655440000
```

**URL Parameters:**
- `fileId` (string, UUID) - The ID of the file

**Successful Response (200):**
```json
{
  "message": "File retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": 1,
    "product_id": null,
    "course_id": null,
    "filename": "user-123-avatar.webp",
    "original_filename": "avatar.jpg",
    "file_type": "image",
    "mime_type": "image/webp",
    "file_size": 15342,
    "file_path": "uploads/avatars/user-123-avatar.webp",
    "category": "avatar",
    "is_public": true,
    "download_count": 5,
    "metadata": {
      "width": 400,
      "height": 400,
      "originalMimetype": "image/jpeg"
    },
    "created_at": "2026-05-17T10:30:00Z",
    "updated_at": "2026-05-17T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "File not found",
  "error_code": "FILE_NOT_FOUND"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/files/550e8400-e29b-41d4-a716-446655440000
```

---

### 7. Get User Avatar

**Endpoint:** `GET /files/users/{userId}/avatar`

**Authentication:** Not required

**Description:** Retrieve the user's latest avatar.

**Request:**
```
GET /api/v1/files/users/1/avatar
```

**URL Parameters:**
- `userId` (integer) - The ID of the user

**Successful Response (200):**
```json
{
  "message": "Avatar retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": 1,
    "filename": "user-123-avatar.webp",
    "original_filename": "avatar.jpg",
    "file_type": "image",
    "mime_type": "image/webp",
    "file_size": 15342,
    "file_path": "uploads/avatars/user-123-avatar.webp",
    "category": "avatar",
    "is_public": true,
    "download_count": 0,
    "metadata": {
      "width": 400,
      "height": 400
    },
    "created_at": "2026-05-17T10:30:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "message": "Avatar not found",
  "error_code": "AVATAR_NOT_FOUND"
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/files/users/1/avatar
```

---

### 8. Delete File

**Endpoint:** `DELETE /files/{fileId}`

**Authentication:** Required (Bearer Token)

**Description:** Delete a file. Removes the file from disk and the database record.

**Request:**
```
DELETE /api/v1/files/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `fileId` (string, UUID) - The ID of the file to delete

**Successful Response (200):**
```json
{
  "message": "File deleted successfully",
  "data": {
    "success": true
  }
}
```

**Error Response (404):**
```json
{
  "message": "File not found",
  "error_code": "FILE_DELETE_FAILED"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/v1/files/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer <access_token>"
```

---

### 9. Get Product Images

**Endpoint:** `GET /files/products/{productId}/images`

**Authentication:** Not required

**Description:** Retrieve all images uploaded for a specific product.

**Request:**
```
GET /api/v1/files/products/550e8400-e29b-41d4-a716-446655440001/images
```

**URL Parameters:**
- `productId` (string, UUID) - The ID of the product

**Successful Response (200):**
```json
{
  "message": "Product images retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "filename": "product-123-abc-def",
      "original_filename": "product-photo.jpg",
      "file_type": "image",
      "mime_type": "image/webp",
      "file_size": 18234,
      "file_path": "uploads/products/product-123-abc-def-medium.webp",
      "category": "product_image",
      "is_public": true,
      "download_count": 23,
      "metadata": {
        "images": {
          "thumbnail": { "url": "uploads/products/...-thumbnail.webp", "size": 5234 },
          "medium": { "url": "uploads/products/...-medium.webp", "size": 18234 },
          "large": { "url": "uploads/products/...-large.webp", "size": 52341 }
        }
      },
      "created_at": "2026-05-17T10:30:00Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/files/products/550e8400-e29b-41d4-a716-446655440001/images
```

---

### 10. Get Product Files

**Endpoint:** `GET /files/products/{productId}/files`

**Authentication:** Not required

**Description:** Retrieve all files (digital products) uploaded for a specific product.

**Request:**
```
GET /api/v1/files/products/550e8400-e29b-41d4-a716-446655440001/files
```

**URL Parameters:**
- `productId` (string, UUID) - The ID of the product

**Successful Response (200):**
```json
{
  "message": "Product files retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "filename": "product-123-abc-def-ebook.pdf",
      "original_filename": "product-guide.pdf",
      "file_type": "document",
      "mime_type": "application/pdf",
      "file_size": 2048576,
      "file_path": "uploads/products/product-123-abc-def-ebook.pdf",
      "category": "product_file",
      "is_public": false,
      "download_count": 15,
      "metadata": {
        "uploadedAt": "2026-05-17T10:30:00Z"
      },
      "created_at": "2026-05-17T10:30:00Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/v1/files/products/550e8400-e29b-41d4-a716-446655440001/files
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `NO_FILE_PROVIDED` | File parameter missing | Ensure file is included in request |
| `AVATAR_UPLOAD_FAILED` | Avatar upload failed | Check file size and type |
| `PRODUCT_IMAGE_UPLOAD_FAILED` | Product image upload failed | Verify image format and size |
| `PRODUCT_FILE_UPLOAD_FAILED` | Product file upload failed | Ensure file is under 1GB |
| `COURSE_MATERIAL_UPLOAD_FAILED` | Course material upload failed | Ensure file is under 500MB |
| `FILE_DOWNLOAD_FAILED` | Download failed | File may have been deleted |
| `FILE_NOT_FOUND` | File doesn't exist | Check file ID |
| `AVATAR_NOT_FOUND` | User has no avatar | Upload an avatar first |
| `GET_PRODUCT_IMAGES_FAILED` | Failed to retrieve images | Check product ID |
| `GET_PRODUCT_FILES_FAILED` | Failed to retrieve files | Check product ID |
| `FILE_DELETE_FAILED` | Deletion failed | Check file ID and permissions |

---

## File Categories

The system supports the following file categories:

| Category | Description | Max Size | Upload Path |
|----------|-------------|----------|-------------|
| `avatar` | User profile avatars | 5MB | `/uploads/avatars/` |
| `product_image` | Product images (3 sizes) | 10MB | `/uploads/products/` |
| `product_file` | Digital product files | 1GB | `/uploads/products/` |
| `course_material` | Course learning materials | 500MB | `/uploads/courses/` |
| `document` | General documents | 1GB | `/uploads/` |

---

## Image Resizing

### Avatar Resizing
- Input: Any size
- Output: 400x400 WebP
- Quality: 80%
- Fit: Cover (crops to fit)
- Position: Center

### Product Image Resizing
- Thumbnail: 200x200 WebP
- Medium: 600x600 WebP
- Large: 1200x1200 WebP
- Quality: 80%
- Fit: Cover (crops to fit)
- Position: Center
- No enlargement if original is smaller

---

## Database Schema

### Files Table
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  course_id UUID REFERENCES courses(id),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_path VARCHAR(500) NOT NULL UNIQUE,
  category ENUM('avatar', 'product_image', 'product_file', 'course_material', 'document'),
  is_public BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Best Practices

1. **File Validation**: Always validate file types on the client side before uploading
2. **Progress Tracking**: Implement upload progress bars for large files
3. **Retry Logic**: Implement exponential backoff for failed uploads
4. **Error Handling**: Always check the error_code in responses
5. **Security**: Keep product files as `is_public: false` for paid products
6. **Optimization**: Use appropriate image size (thumbnail, medium, large) in your UI
7. **Download Tracking**: Monitor download_count to understand user behavior
8. **Cleanup**: Implement periodic cleanup of orphaned files

---

## Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=deskmain
DB_USER=postgres
DB_PASSWORD=postgres

# Server
NODE_ENV=development
PORT=3000

# File Upload Settings
MAX_FILE_SIZE=1073741824  # 1GB in bytes
MAX_AVATAR_SIZE=5242880   # 5MB in bytes
MAX_IMAGE_SIZE=10485760   # 10MB in bytes
MAX_COURSE_SIZE=524288000 # 500MB in bytes
```

---

## Testing

### Test with cURL

**Upload Avatar:**
```bash
curl -X POST http://localhost:3000/api/v1/files/avatar \
  -H "Authorization: Bearer <token>" \
  -F "file=@avatar.jpg"
```

**Get Product Images:**
```bash
curl http://localhost:3000/api/v1/files/products/{productId}/images
```

**Download File:**
```bash
curl -O -J http://localhost:3000/api/v1/files/{fileId}/download
```

---

## Support

For issues or questions:
1. Check error response codes
2. Verify file size and type constraints
3. Ensure authentication token is valid
4. Check database migration has been run
5. Review file service logs for detailed errors

---

**API Version:** 1.0.0  
**Last Updated:** May 17, 2026

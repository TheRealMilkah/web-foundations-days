# Library API - Books Resource

Base URL: /api

## 1. List all books
- **Method:** GET
- **Path:** /api/books
- **Description:** Retrieve a list of all books in the library.
- **Request Body:** None
- **Success Status:** 200 OK

## 2. Get one book
- **Method:** GET
- **Path:** /api/books/:id
- **Description:** Retrieve details of a single book by its ID.
- **Request Body:** None
- **Success Status:** 200 OK

## 3. Create a new book
- **Method:** POST
- **Path:** /api/books
- **Description:** Add a new book to the library.
- **Request Body:** { "title": "Things Fall Apart", "author": "Chinua Achebe", "year": 1958, "isbn": "9780385474542" }
- **Success Status:** 201 Created

## 4. Update a book
- **Method:** PUT
- **Path:** /api/books/:id
- **Description:** Replace all fields of an existing book.
- **Request Body:** { "title": "Updated Title", "author": "Chinua Achebe", "year": 1959, "isbn": "9780385474542" }
- **Success Status:** 200 OK

## 5. Delete a book
- **Method:** DELETE
- **Path:** /api/books/:id
- **Description:** Remove a book from the library.
- **Request Body:** None
- **Success Status:** 204 No Content

## 6. List books by author
- **Method:** GET
- **Path:** /api/books?author=Chinua%20Achebe
- **Description:** Retrieve books filtered by author name using a query parameter.
- **Request Body:** None
- **Success Status:** 200 OK

## Error Codes
- **400 Bad Request** - When: missing required fields. Example: POST /api/books with body {"author":"Achebe"} returns 400 because title is required.
- **404 Not Found** - When: ID does not exist. Example: GET /api/books/9999 returns 404.

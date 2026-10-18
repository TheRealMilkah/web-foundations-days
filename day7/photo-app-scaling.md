# Day 7 Assignment: Scaling a Photo-Sharing App

## 1. Assumptions

The application has 10 million registered users, and 10% of them use the application each day. Each daily active user uploads one photo and views 50 feed pages per day. Each original photo is 2 MB, and each thumbnail is 50 KB.

For these calculations, I assume 365 days per year, 86,400 seconds per day, and decimal storage units (1 TB = 1,000,000 MB). Peak traffic is estimated at five times the average traffic. The storage estimates exclude replication, backups, and additional storage overhead.

## 2. Daily Active Users (DAU)

Daily active users are the number of registered users who use the application on a typical day.

**Calculation:**

10,000,000 registered users × 10% active users = 1,000,000 DAU

**Answer: 1 million daily active users.**

## 3. Average Photo Uploads per Second

Each daily active user uploads one photo per day.

**Uploads per day:**

1,000,000 DAU × 1 photo = 1,000,000 uploads per day

**Average uploads per second:**

1,000,000 ÷ 86,400 = approximately 11.6 uploads per second

**Answer: Approximately 12 uploads per second on average.**

## 4. Feed Views per Second

Each daily active user views 50 feed pages per day.

**Feed views per day:**

1,000,000 DAU × 50 views = 50,000,000 feed views per day

**Average feed views per second:**

50,000,000 ÷ 86,400 = approximately 579 feed views per second

**Peak feed views per second:**

579 × 5 = approximately 2,895 feed views per second

**Answer:** The application handles approximately 579 feed views per second on average and 2,895 feed views per second during peak periods.

## 5. Photo Storage per Year

Each user uploads one original photo per day. The application also creates one 50 KB thumbnail for each original photo.

### Original photo storage

1,000,000 photos per day × 2 MB = 2,000,000 MB per day

2,000,000 MB × 365 days = 730,000,000 MB per year

730,000,000 MB ÷ 1,000,000 = **730 TB per year**

### Thumbnail storage

1,000,000 thumbnails per day × 50 KB = 50,000,000 KB per day

50,000,000 KB × 365 days = 18,250,000,000 KB per year

18,250,000,000 KB ÷ 1,000,000,000 = **18.25 TB per year**

### Total storage

730 TB + 18.25 TB = **748.25 TB per year**

The application therefore needs approximately 748.25 TB of additional storage annually for original photos and thumbnails, before accounting for backups, replication, and other overhead.

## 6. Is the Application Read-Heavy or Write-Heavy?

The application is **read-heavy** because users view 50 feed pages for every photo they upload. Feed views create much more frequent read traffic than photo uploads create write traffic.

A CDN can serve frequently requested images, a cache can reduce repeated database queries, and a database read replica can handle some read requests. These measures help reduce the load on the primary database and improve response times.

## 7. Proposed Architecture

```text
                         USERS
                           |
                           v
                    +-------------+
                    |     CDN     |
                    +-------------+
                           |
                           v
                    +-------------+
                    |Load Balancer|
                    +-------------+
                           |
                           v
                    +-------------+
                    | App Servers |
                    +-------------+
                      /    |    \
                     /     |     \
                    v      v      v
               +-------+ +------+ +----------------+
               | Cache | |Primary| | Object Storage|
               |       | |  DB   | | Original Photos|
               +-------+ +------+ +----------------+
                            |
                            v
                      +-----------+
                      |Read Replica|
                      +-----------+

                App Servers
                     |
                     v
                +-----------+
                |   Queue   |
                +-----------+
                     |
                     v
              +-----------------+
              | Thumbnail Worker|
              +-----------------+
                     |
                     v
              +----------------+
              | Object Storage |
              |   Thumbnails   |
              +----------------+
```

### What Each Component Does

1. **CDN:** Delivers cached images and other cacheable content from locations closer to users.
2. **Load balancer:** Distributes incoming requests across available application servers.
3. **Application servers:** Authenticate users, validate requests, coordinate photo uploads, manage feed requests, and communicate with other services.
4. **Cache:** Stores frequently accessed feed data and metadata temporarily to reduce repeated database queries.
5. **Primary database:** Stores persistent information such as user records, photo metadata, and upload status.
6. **Read replica:** Handles eligible database read requests to reduce the workload on the primary database.
7. **Object storage:** Stores original photos and generated thumbnails without placing large image files directly in the database.
8. **Queue:** Holds thumbnail-generation jobs so that image processing can happen asynchronously.
9. **Thumbnail worker:** Retrieves queued jobs, generates smaller versions of original photos, saves the thumbnails, and updates processing status.

## 8. Step-by-Step Photo Upload Flow

1. A user selects a photo and submits an upload request.
2. The application server authenticates the user and validates the file type, size, and other upload requirements.
3. The application stores the original photo in object storage.
4. The application records the photo metadata and upload status in the primary database.
5. The application places a thumbnail-generation job on the queue.
6. The application returns an upload confirmation to the user once the original photo has been stored and the request has been accepted.
7. The thumbnail worker retrieves the queued job and reads the original photo from object storage.
8. The worker generates a smaller thumbnail and stores it in object storage.
9. The worker updates the photo's processing status in the database.
10. The CDN can then deliver the original photo or thumbnail to users, subject to cache configuration and access permissions.

## 9. Architecture Trade-Offs

### Trade-Off 1: Caching vs. Freshness

Caching reduces database load and improves response times. However, cached feed data may become outdated after a user uploads a photo or changes their profile. The application needs a cache invalidation or expiration strategy to keep important information reasonably current.

### Trade-Off 2: Asynchronous Processing vs. Immediate Availability

Using a queue allows the application to accept uploads without waiting for thumbnail generation to finish. However, a thumbnail may not be immediately available, and failed jobs may require retries. The application should track processing status and handle failed jobs safely.

### Trade-Off 3: Read Replicas vs. Consistency

A read replica can handle additional read traffic and reduce pressure on the primary database. However, replication lag may cause users to see recently updated information later than expected. Requests that require the latest data may need to read from the primary database.

### Trade-Off 4: Object Storage vs. Database Storage

Object storage is suitable for large photo files and can scale independently of the database. However, storing the image and its metadata involves coordinating two systems. The application must handle partial failures, such as a photo being stored successfully while the metadata write fails.

## 10. Conclusion

The photo-sharing application has approximately 1 million daily active users, 12 average photo uploads per second, and 579 average feed views per second. Peak feed traffic is estimated at 2,895 views per second. Original photos and thumbnails require approximately 748.25 TB of additional storage per year.

A scalable design uses a CDN, load balancer, application servers, caching, a primary database with a read replica, object storage, a job queue, and thumbnail workers. This architecture supports high read traffic while allowing photo processing to happen asynchronously.
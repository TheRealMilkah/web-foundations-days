# Day 7 Assignment: Scaling a Photo-Sharing App

## 1. Assumptions

The application has 10 million registered users, and 10% of them use the application each day. Each daily active user uploads one photo and views 50 feed pages per day. Each original photo is 2 MB, and each thumbnail is 50 KB.

For these calculations, I assume 365 days per year and 86,400 seconds per day. Storage uses decimal units, where 1 TB equals 1,000,000 MB or 1,000,000,000 KB. Peak traffic is estimated at five times the average traffic. The storage estimates exclude backups, replication, and other storage overhead.

## 2. Daily Active Users (DAU)

Daily active users are the number of registered users who use the application on a typical day.

**Calculation:**

10,000,000 registered users × 10% active users = 1,000,000 DAU

**Answer: 1 million daily active users.**

## 3. Average and Peak Photo Uploads per Second

Each daily active user uploads one photo per day.

**Uploads per day:**

1,000,000 DAU × 1 photo = 1,000,000 uploads per day

**Average uploads per second:**

1,000,000 ÷ 86,400 = approximately 11.57 uploads per second

**Peak uploads per second:**

11.57 × 5 = approximately 57.87 uploads per second

**Answer:** The application handles approximately 12 photo uploads per second on average and 58 uploads per second during peak periods. Application servers, network bandwidth, and object storage must be able to handle the higher upload rate.

## 4. Average and Peak Feed Views per Second

Each daily active user views 50 feed pages per day.

**Feed views per day:**

1,000,000 DAU × 50 views = 50,000,000 feed views per day

**Average feed views per second:**

50,000,000 ÷ 86,400 = approximately 578.70 feed views per second

**Peak feed views per second:**

578.70 × 5 = approximately 2,893.52 feed views per second

**Answer:** The application handles approximately 579 feed views per second on average and 2,894 feed views per second during peak periods.

These figures represent estimated request rates. Actual traffic will vary depending on user activity and daily usage patterns.

## 5. Photo Storage per Year

Each daily active user uploads one original photo per day. The application also generates one thumbnail of 50 KB for every original photo.

### Original Photo Storage

1,000,000 photos per day × 2 MB = 2,000,000 MB per day

2,000,000 MB × 365 days = 730,000,000 MB per year

730,000,000 MB ÷ 1,000,000 = **730 TB per year**

### Thumbnail Storage

1,000,000 thumbnails per day × 50 KB = 50,000,000 KB per day

50,000,000 KB × 365 days = 18,250,000,000 KB per year

18,250,000,000 KB ÷ 1,000,000,000 = **18.25 TB per year**

### Total Storage

730 TB + 18.25 TB = **748.25 TB per year**

The application therefore needs approximately 748.25 TB of additional storage annually for original photos and thumbnails, before accounting for backups, replication, and other overhead.

## 6. Is the Application Read-Heavy or Write-Heavy?

The application is **read-heavy** because users view 50 feed pages for every photo they upload. This creates substantially more feed-read requests than photo-upload requests.

A content delivery network (CDN) can serve frequently requested images, a cache can reduce repeated database queries, and a database read replica can handle eligible read requests. These components reduce pressure on the primary database and help maintain response times during traffic spikes.

## 7. Proposed Architecture

```text
                         USERS
                           |
                           v
                    +-------------+
                    |     CDN     |
                    +-------------+
                      |         |
             Cached images     | Dynamic requests
                               v
                        +--------------+
                        | Load Balancer|
                        +--------------+
                               |
                               v
                        +--------------+
                        | App Servers  |
                        +--------------+
                         |     |      |
                         v     v      v
                    +-------+ +------+ +----------------+
                    | Cache | |Primary| | Object Storage|
                    |       | |  DB   | | Original Photos|
                    +-------+ +------+ +----------------+
                                 |
                                 | Replication
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
                         |           |
              Reads original         | Writes thumbnail
                         v           v
                    +----------------------+
                    |    Object Storage    |
                    | Originals + Thumbnails|
                    +----------------------+
```

### What Each Component Does

1. **CDN:** Delivers cached images from locations closer to users, reducing latency and repeated requests to object storage.
2. **Load balancer:** Distributes incoming dynamic requests across available application servers.
3. **Application servers:** Authenticate users, validate uploads, coordinate photo storage, manage feed requests, and communicate with the database, cache, and queue.
4. **Cache:** Temporarily stores frequently accessed feed data and metadata to reduce repeated database queries.
5. **Primary database:** Stores persistent records, including user information, photo metadata, storage locations, and processing status.
6. **Read replica:** Receives database updates from the primary database and handles eligible read requests to reduce the primary database's workload.
7. **Object storage:** Stores original photo files and generated thumbnails separately from database records.
8. **Queue:** Holds thumbnail-generation jobs until workers are ready to process them.
9. **Thumbnail worker:** Retrieves queued jobs, reads original photos from object storage, generates thumbnails, saves them, and updates processing status in the database.

## 8. Step-by-Step Photo Upload Flow

1. A user selects a photo and submits an upload request.
2. The load balancer forwards the request to an available application server.
3. The application server authenticates the user and validates the file type, file size, and upload permissions.
4. The application stores the original photo in object storage and records its metadata and storage location in the primary database.
5. The application publishes a thumbnail-generation job to the queue. The job contains the photo identifier and the location of the original image.
6. Once the original photo has been stored and the request has been accepted, the application confirms the upload to the user. Thumbnail generation continues asynchronously.
7. The thumbnail worker retrieves a job from the queue and reads the original photo from object storage.
8. The worker resizes the original photo to create a smaller thumbnail and converts it to the required image format.
9. The worker saves the thumbnail in object storage using a unique storage key.
10. The worker updates the photo's processing status in the primary database to indicate that the thumbnail is ready.
11. If processing fails, the worker retries the job according to a defined retry policy. Repeated failures are logged and can be moved to a dead-letter queue for investigation.
12. Once the thumbnail is available, the application can include its location in feed responses, and the CDN can cache and deliver it to users.

This asynchronous process allows the application to accept photo uploads without waiting for thumbnail generation to finish. Processing status and retry handling help the system recover from temporary failures.

## 9. Architecture Trade-Offs

### Trade-Off 1: Caching vs. Data Freshness

Caching reduces database load and improves response times. However, cached feed data may not immediately reflect a newly uploaded photo or an updated profile.

The application can invalidate affected cache entries when content changes and use expiration policies for cached data. These approaches improve freshness but add complexity and may increase database traffic when cache entries expire or are invalidated.

### Trade-Off 2: Eventual Consistency vs. Immediate Feed Updates

A read replica may take time to receive changes from the primary database. As a result, a newly uploaded photo may not appear immediately in every feed. This is an example of eventual consistency.

The application can use the primary database for requests requiring the latest confirmed information and update or invalidate relevant cached feed entries after a successful upload. This improves consistency but can increase primary database load and complicate feed processing.

### Trade-Off 3: Storage Costs vs. Performance and Availability

Storing original photos and thumbnails requires approximately 748.25 TB of additional capacity per year. Keeping both versions makes image delivery more efficient because thumbnails are smaller and faster to download, but it increases storage costs.

The application can use image compression, storage lifecycle policies, and appropriate retention rules to control costs. A CDN can reduce repeated requests to object storage. Archiving older images may lower storage expenses, but retrieving archived files can take longer. Regenerating deleted thumbnails can save storage but adds processing costs and delays thumbnail availability.

### Trade-Off 4: Asynchronous Processing vs. Immediate Thumbnail Availability

A queue allows uploads to finish without waiting for thumbnail generation, helping application servers handle bursts of traffic. However, a queue backlog or worker failure can delay thumbnails.

The application should monitor queue length, scale workers according to demand, retry failed jobs, and track processing status. A temporary placeholder can be displayed while a thumbnail is being generated.

### Trade-Off 5: Object Storage vs. Database Storage

Object storage can scale independently of the database and is suitable for large image files. Storing photo metadata in the database makes records easier to query without placing image files directly in database tables.

However, the object store and database can experience partial failures. For example, an original photo might be stored successfully while the metadata write fails. The application should use appropriate error handling, retries, and cleanup procedures to prevent orphaned files and incomplete records.

## 10. Conclusion

The photo-sharing application has approximately 1 million daily active users. It handles around 12 photo uploads per second on average, with peak uploads estimated at 58 per second. Feed traffic averages approximately 579 views per second and reaches approximately 2,894 views per second during peak periods.

Original photos require approximately 730 TB of additional storage annually, while thumbnails require 18.25 TB, giving a combined estimate of 748.25 TB per year before backups, replication, and other overhead.

A scalable architecture combines a CDN, load balancer, application servers, caching, a primary database with a read replica, object storage, a queue, and thumbnail workers. Careful capacity planning, asynchronous processing, cache management, and consistency policies help the application handle high traffic while balancing performance, reliability, and storage costs.
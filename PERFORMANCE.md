# Performance & Concurrent Users

## 1. Overview

The MediCare Hospital Management System is designed to support multiple simultaneous users accessing the system through a separated frontend and backend architecture.

The system uses:

* Stateless JWT authentication
* Role-based API access
* Node.js and Express.js backend
* PostgreSQL relational database
* Separated React frontend and backend
* RESTful API architecture

The system is intended to support concurrent access by different hospital staff members, including Administrators, Doctors, Nurses, Receptionists, Pharmacists, Laboratory Technicians, and Accountants.

---

## 2. Performance Testing

Concurrent-load testing was performed using **Autocannon** against the running Node.js/Express backend.

### Testing Tool

**Autocannon** was used to simulate multiple simultaneous client connections and measure:

* Request latency
* Requests per second
* Data throughput
* Maximum observed latency
* Total number of requests processed

### Test Endpoint

```text
http://localhost:5000/
```

### Test Duration

Each test was performed for approximately **20 seconds**.

### Concurrent Connection Levels

Three levels of concurrent connections were tested:

* 10 concurrent connections
* 20 concurrent connections
* 50 concurrent connections

---

## 3. Test Results

### 3.1 Test with 10 Concurrent Connections

| Metric                    |               Result |
| ------------------------- | -------------------: |
| Concurrent connections    |                   10 |
| Test duration             |        20.11 seconds |
| Average latency           |              1.79 ms |
| 97.5th percentile latency |                11 ms |
| 99th percentile latency   |                20 ms |
| Maximum latency           |               185 ms |
| Average requests/sec      |             4,517.95 |
| Total requests            | Approximately 90,000 |
| Data transferred          |              29.1 MB |

---

### 3.2 Test with 20 Concurrent Connections

| Metric                    |                Result |
| ------------------------- | --------------------: |
| Concurrent connections    |                    20 |
| Test duration             |         20.03 seconds |
| Average latency           |               0.19 ms |
| 97.5th percentile latency |                  1 ms |
| 99th percentile latency   |                  2 ms |
| Maximum latency           |                 23 ms |
| Average requests/sec      |              23,262.4 |
| Total requests            | Approximately 465,000 |
| Data transferred          |                150 MB |

---

### 3.3 Test with 50 Concurrent Connections

| Metric                    |                Result |
| ------------------------- | --------------------: |
| Concurrent connections    |                    50 |
| Test duration             |         20.04 seconds |
| Average latency           |               2.27 ms |
| 97.5th percentile latency |                  5 ms |
| 99th percentile latency   |                  6 ms |
| Maximum latency           |                 36 ms |
| Average requests/sec      |              17,579.8 |
| Total requests            | Approximately 352,000 |
| Data transferred          |                113 MB |

---

## 4. Performance Summary

The results from the three concurrent-load tests are summarized below.

| Concurrent Connections | Avg. Latency | 97.5% Latency | 99% Latency | Avg. Req/Sec | Total Requests |
| ---------------------: | -----------: | ------------: | ----------: | -----------: | -------------: |
|                     10 |      1.79 ms |         11 ms |       20 ms |     4,517.95 |        ~90,000 |
|                     20 |      0.19 ms |          1 ms |        2 ms |     23,262.4 |       ~465,000 |
|                     50 |      2.27 ms |          5 ms |        6 ms |     17,579.8 |       ~352,000 |

At **50 concurrent connections**, the backend achieved:

* **2.27 ms average latency**
* **5 ms latency at the 97.5th percentile**
* **6 ms latency at the 99th percentile**
* **36 ms maximum observed latency**
* **17,579.8 requests per second average throughput**
* Approximately **352,000 requests** during the 20-second test

No request errors were reported in the Autocannon output.

---

## 5. Concurrent User Support

The performance tests demonstrate that the backend remained responsive while handling concurrent connections.

The 50-connection test is particularly relevant to the system's concurrent-user requirement because it demonstrates that the backend successfully processed requests from 50 simultaneous connections during the test period.

The system's stateless JWT authentication and separated frontend/backend architecture also support concurrent access by users with different roles.

---

## 6. Test Environment

The performance tests were performed against the locally running backend.

### Technologies

* Node.js
* Express.js
* PostgreSQL
* Autocannon
* REST API

### Backend

```text
http://localhost:5000/
```

The tests were performed in a local development environment. Therefore, the results should be considered **local benchmark results** and may differ when the application is deployed to a production hosting environment.

---

## 7. Test Method

The following Autocannon commands were used.

### 10 Concurrent Connections

```bash
npx autocannon -c 10 -d 20 http://localhost:5000/
```

### 20 Concurrent Connections

```bash
npx autocannon -c 20 -d 20 http://localhost:5000/
```

### 50 Concurrent Connections

```bash
npx autocannon -c 50 -d 20 http://localhost:5000/
```

Where:

* `-c` specifies the number of concurrent connections.
* `-d 20` specifies a test duration of 20 seconds.

---

## 8. Interpretation of Results

The tests show that the Node.js/Express backend was able to process a high volume of concurrent requests while maintaining low response latency.

The 50-concurrent-connection test produced an average latency of **2.27 ms**, while 97.5% of requests completed within **5 ms**.

The maximum observed latency during this test was **36 ms**.

These results indicate good baseline backend responsiveness under the tested concurrent workload.

---

## 9. Testing Limitations

The performance tests were performed against:

```text
http://localhost:5000/
```

Therefore, the results represent a **backend concurrent-request benchmark** and should not be interpreted as individual performance measurements for every HMS operation.

The following operations were not separately benchmarked:

* User login
* Dashboard loading
* Patient list retrieval
* Patient creation
* Appointment creation
* Medical record operations
* Laboratory operations
* Pharmacy operations
* Billing operations
* Report generation

Database performance, network latency, hosting resources, and production infrastructure may also affect real-world performance.

Additional endpoint-specific testing can be performed if detailed performance measurements for individual modules are required.

---

## 10. Conclusion

Based on the conducted Autocannon tests, the MediCare Hospital Management System backend demonstrated good baseline performance under concurrent request loads of **10, 20, and 50 connections**.

The backend maintained low latency while processing a large number of requests during the 20-second test periods.

The results provide practical evidence that the system can handle concurrent backend requests for the intended academic hospital-management application.

Further performance testing of individual API endpoints and production infrastructure can be performed as part of future performance evaluation.
# SQL Performance Lab

An interactive full-stack demo that explains **why SQL queries become slow** and **how proper optimizations improve performance**.

Instead of answering SQL performance questions theoretically, this project lets users **run real scenarios**, compare **slow vs optimized executions**, and **see how database behavior changes**.

---

## 🚀 What This Project Is

**SQL Performance Lab** is a learning-focused application designed for:
- Understanding real-world SQL performance issues
- Demonstrating backend engineering concepts visually

It intentionally focuses on **clarity and teaching**, not raw benchmarking.

---

## 🏗️ Architecture Overview

React (Vite) Frontend
↓
Spring Boot REST API
↓
H2 In-Memory Database


### Why this architecture?
- Zero database setup
- Fast startup
- Focuses on SQL behavior instead of infrastructure

---

## 🧪 Scenarios Implemented

This lab currently demonstrates **two high-impact SQL performance scenarios**.

---

## 1️⃣ Missing Index

### ❌ Slow Query

```sql
SELECT id, customer_id, amount
FROM orders
WHERE customer_id = 42;
Why it’s slow:

No index on customer_id

Database performs a full table scan

Every row must be inspected

Does not scale as data grows

✅ Optimized Query
CREATE INDEX idx_orders_customer ON orders(customer_id);
Why it’s faster:

Database can directly locate matching rows

Fewer rows scanned

Reduced CPU and memory usage

Execution plan switches from table scan → index scan

💡 Key Learning
Execution plans matter more than raw execution time, especially at scale.

2️⃣ Cursor vs Set-Based Aggregation
❌ Slow (Cursor-Style / Row-by-Row Processing)
Simulated in application code:

List<Integer> salaries = jdbc.query(
    "SELECT salary FROM employees",
    (rs, i) -> rs.getInt("salary")
);

for (int salary : salaries) {
    sum += salary;
    Thread.sleep(1); // simulate per-row cost
}
Why it’s slow:

Rows are processed one at a time

Higher CPU overhead

Database optimizations cannot be applied

Poor scalability

✅ Optimized (Set-Based SQL)
SELECT SUM(salary) FROM employees;
Why it’s faster:

Aggregation happens inside the database engine

Optimized execution algorithms

Minimal data movement

Scales efficiently

💡 Key Learning
If logic can be done in SQL, it should be done in SQL.

⏱️ Why Slow Queries Are Always Slower in This Demo
This project uses an H2 in-memory database, which is extremely fast.
In real production systems, slow queries naturally take longer due to disk I/O and network latency.

To make the demo deterministic and educational, a small artificial delay is added to slow scenarios:

Thread.sleep(25);
This simulates real-world performance costs and ensures consistent learning outcomes.

🖥️ Frontend Features
Scenario selector

Side-by-side slow vs optimized comparison

Execution time bar chart

Human-readable explanations

Production scale simulator

Clear disclaimer about timing variability

🧠 What This Project Teaches
Why missing indexes cause table scans

Why cursor-style logic does not scale

Why execution plans matter

How databases optimize queries

How performance issues appear in real applications

▶️ How to Run the Project
Backend
cd backend
mvn spring-boot:run
Backend runs on:

http://localhost:8080
Frontend
cd frontend
npm install
npm run dev
Open in browser:

http://localhost:5173
📌 Why H2 In-Memory Database?
No external setup required

Instant startup

Ideal for demos

Keeps focus on query behavior, not infrastructure

🏁 Final Takeaway
SQL performance issues are rarely about syntax — they are about how the database executes your query.

This project makes that execution behavior visible and understandable.
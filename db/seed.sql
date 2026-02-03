CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT,
  amount NUMERIC,
  created_at TIMESTAMP
);

CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  salary BIGINT
);

INSERT INTO customers(name)
SELECT 'Customer ' || generate_series(1, 5000);

INSERT INTO orders(customer_id, amount, created_at)
SELECT
  (random() * 4999 + 1)::bigint,
  random() * 5000,
  now() - (random() * interval '365 days')
FROM generate_series(1, 200000);

INSERT INTO employees(salary)
SELECT (random() * 90000 + 30000)::bigint
FROM generate_series(1, 100000);

-- Cursor-style function
CREATE OR REPLACE FUNCTION cursor_sum_salary()
RETURNS BIGINT
LANGUAGE plpgsql AS $$
DECLARE
  total BIGINT := 0;
  r RECORD;
BEGIN
  FOR r IN SELECT salary FROM employees LOOP
    total := total + r.salary;
  END LOOP;
  RETURN total;
END;
$$;

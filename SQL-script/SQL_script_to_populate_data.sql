TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE carts CASCADE;

-- data for carts table
INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '11111111-2222-3333-4444-555555555555', '2026-05-01', '2026-05-01', 'ORDERED'),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '11111111-2222-3333-4444-555555555555', '2026-06-01', '2026-06-02', 'OPEN'),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', '99999999-8888-7777-6666-555555555555', '2026-05-15', '2026-05-20', 'ORDERED'),
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', '88888888-7777-6666-5555-444444444444', '2026-06-03', '2026-06-04', 'OPEN');

-- data for cart_items table
INSERT INTO cart_items (cart_id, product_id, count) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 1),

('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'cccccccc-dddd-eeee-ffff-aaaaaaaaaaaa', 5),

('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 1),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'dddddddd-eeee-ffff-aaaa-bbbbbbbbbbbb', 3),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'eeeeeeee-ffff-aaaa-bbbb-cccccccccccc', 10),

('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 4);

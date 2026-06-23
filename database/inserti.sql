INSERT INTO categories (name) VALUES
('Clothing'),
('Accessories'),
('Home Decor'),
('Amigurumi'),
('Baby Projects'),
('Bags'),
('Holiday Projects'),
('Gifts'),
('Kitchen Items'),
('Bathroom Items');

INSERT INTO materials (name) VALUES
('Cotton Yarn'),
('Wool Yarn'),
('Acrylic Yarn'),
('Crochet Hook 3mm'),
('Crochet Hook 4mm'),
('Crochet Hook 5mm'),
('Buttons'),
('Zipper'),
('Toy Stuffing'),
('Safety Eyes'),
('Yarn Needle'),
('Scissors'),
('Stitch Markers'),
('Measuring Tape');

INSERT INTO tags (name) VALUES
('gift'),
('home'),
('baby'),
('kids'),
('winter'),
('summer'),
('cozy'),
('colorful'),
('minimalist'),
('modern'),
('classic'),
('cute'),
('floral'),
('animal'),
('holiday'),
('practical'),
('decorative'),
('wearable'),
('small project'),
('large project');

SELECT * FROM projects;
SELECT * FROM project_tags;
SELECT * FROM project_materials;
UPDATE users SET role_id = 1 WHERE id = 1;
SELECT * FROM reviews;
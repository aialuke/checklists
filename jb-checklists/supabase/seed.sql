-- Insert sample staff
INSERT INTO staff (staff_number, name, role) VALUES
('12345', 'John Smith', 'TEAM_MEMBER'),
('67890', 'Sarah Johnson', 'MANAGER'),
('11111', 'Mike Brown', 'TEAM_MEMBER'),
('22222', 'Lisa Wilson', 'TEAM_MEMBER');

-- Insert checklists
INSERT INTO checklists (department, type) VALUES
('Computers', 'OPENING'),
('Computers', 'CLOSING'),
('Electronics', 'OPENING'),
('Electronics', 'CLOSING'),
('Manager', 'OPENING'),
('Manager', 'CLOSING');

-- Insert tasks for Computers Opening
WITH computers_opening AS (
  SELECT id FROM checklists WHERE department = 'Computers' AND type = 'OPENING'
)
INSERT INTO tasks (checklist_id, description, order_index) 
SELECT co.id, task_desc, task_order
FROM computers_opening co,
(VALUES 
  ('Turn on all computer displays', 1),
  ('Boot up demo computers', 2),
  ('Check printer paper and ink levels', 3),
  ('Verify internet connectivity on demo units', 4),
  ('Update price tags and promotional materials', 5),
  ('Check security cables on all devices', 6),
  ('Turn on department lighting', 7)
) AS tasks(task_desc, task_order);

-- Insert tasks for Computers Closing
WITH computers_closing AS (
  SELECT id FROM checklists WHERE department = 'Computers' AND type = 'CLOSING'
)
INSERT INTO tasks (checklist_id, description, order_index)
SELECT cc.id, task_desc, task_order
FROM computers_closing cc,
(VALUES 
  ('Shut down all demo computers properly', 1),
  ('Turn off computer displays', 2),
  ('Secure all devices and accessories', 3),
  ('Check for any damaged items', 4),
  ('Clean keyboards and mice', 5),
  ('Lock computer cabinets', 6),
  ('Turn off department lighting', 7)
) AS tasks(task_desc, task_order);

-- Insert tasks for Electronics Opening
WITH electronics_opening AS (
  SELECT id FROM checklists WHERE department = 'Electronics' AND type = 'OPENING'
)
INSERT INTO tasks (checklist_id, description, order_index)
SELECT eo.id, task_desc, task_order
FROM electronics_opening eo,
(VALUES 
  ('Turn on all display TVs and speakers', 1),
  ('Check audio system functionality', 2),
  ('Verify gaming console demo units', 3),
  ('Update promotional displays', 4),
  ('Check charging stations for devices', 5),
  ('Turn on department lighting', 6)
) AS tasks(task_desc, task_order);

-- Insert tasks for Electronics Closing
WITH electronics_closing AS (
  SELECT id FROM checklists WHERE department = 'Electronics' AND type = 'CLOSING'
)
INSERT INTO tasks (checklist_id, description, order_index)
SELECT ec.id, task_desc, task_order
FROM electronics_closing ec,
(VALUES 
  ('Turn off all display TVs and speakers', 1),
  ('Secure gaming consoles and accessories', 2),
  ('Check charging cables are properly stored', 3),
  ('Clean display surfaces', 4),
  ('Lock electronics cabinets', 5),
  ('Turn off department lighting', 6)
) AS tasks(task_desc, task_order);

-- Insert tasks for Manager Opening
WITH manager_opening AS (
  SELECT id FROM checklists WHERE department = 'Manager' AND type = 'OPENING'
)
INSERT INTO tasks (checklist_id, description, order_index)
SELECT mo.id, task_desc, task_order
FROM manager_opening mo,
(VALUES 
  ('Unlock main entrance doors', 1),
  ('Turn on store lighting systems', 2),
  ('Check security system status', 3),
  ('Review overnight reports', 4),
  ('Check cash register functionality', 5),
  ('Verify staff schedule for the day', 6),
  ('Check emergency exits are clear', 7)
) AS tasks(task_desc, task_order);

-- Insert tasks for Manager Closing
WITH manager_closing AS (
  SELECT id FROM checklists WHERE department = 'Manager' AND type = 'CLOSING'
)
INSERT INTO tasks (checklist_id, description, order_index)
SELECT mc.id, task_desc, task_order
FROM manager_closing mc,
(VALUES 
  ('Complete daily sales reconciliation', 1),
  ('Secure all cash registers', 2),
  ('Check all departments are secured', 3),
  ('Set security system', 4),
  ('Turn off main store lighting', 5),
  ('Lock main entrance doors', 6),
  ('Complete closing paperwork', 7)
) AS tasks(task_desc, task_order);
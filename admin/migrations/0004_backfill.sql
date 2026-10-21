UPDATE projects SET status_en='Completed', status_ro='Finalizat' WHERE status='completed';
UPDATE projects SET status_en='In progress', status_ro='În curs' WHERE status='in_progress';
UPDATE projects SET status_en='Feasibility study', status_ro='Studiu de fezabilitate' WHERE status='feasibility_study';
UPDATE projects SET status_en='Competition entry', status_ro='Concurs' WHERE status='competition';
UPDATE projects SET status_en='Unbuilt', status_ro='Neconstruit' WHERE status='unbuilt';
UPDATE projects SET status_en='Study', status_ro='Studiu' WHERE status='study';
UPDATE projects SET index_only=1 WHERE status IN ('in_progress','feasibility_study');
UPDATE projects SET type_en=type, location_en=location, title_ro=title;

-- Teams with a rejected invite should be fully cancelled so the leader can register again.

UPDATE team_registration tr
INNER JOIN (
    SELECT DISTINCT tm.team_registration_id AS team_id
    FROM team_member tm
    WHERE tm.invitation_status = 'REJECTED'
) rejected ON rejected.team_id = tr.id
SET tr.status = 'CANCELLED'
WHERE tr.status IN ('BUILDING', 'INCOMPLETE', 'ACTIVE');

UPDATE programme_registration pr
INNER JOIN team_registration tr ON pr.team_registration_id = tr.id
SET pr.status = 'CANCELLED'
WHERE tr.status = 'CANCELLED'
  AND pr.status IN ('PENDING_TEAM', 'PENDING_INVITE', 'ACTIVE');

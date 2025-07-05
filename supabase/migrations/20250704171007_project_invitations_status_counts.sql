create or replace view project_invitation_status_counts as
select
  p.id as project_id,
  p.name as project_name,
  ci.status,
  count(*) as invitation_count
from projects p
join creator_invitations ci on ci.project_id = p.id
group by p.id, p.name, ci.status;

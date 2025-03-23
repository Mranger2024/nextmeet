-- Drop existing policies
drop policy if exists "Enable read access for group members" on rooms;
drop policy if exists "Enable insert for authenticated users" on rooms;
drop policy if exists "Enable update for room host" on rooms;
drop policy if exists "Enable delete for room host" on rooms;

-- Create rooms table if not exists
create table if not exists rooms (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    group_id uuid references groups(id) on delete cascade not null,
    host_id uuid references profiles(id) on delete cascade not null,
    password text,
    status text check (status in ('waiting', 'active', 'ended')) not null default 'waiting',
    video_chat_url text,
    participant_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_rooms_group_id on rooms(group_id);
create index if not exists idx_rooms_host_id on rooms(host_id);
create index if not exists idx_rooms_status on rooms(status);

-- Enable RLS
alter table rooms enable row level security;

-- Create RLS policies for rooms
create policy "Enable read access for group members" on rooms
    for select using (
        exists (
            select 1 from group_members
            where group_members.group_id = rooms.group_id
            and group_members.user_id = auth.uid()
        )
    );

create policy "Enable insert for authenticated users" on rooms
    for insert
    with check (
        auth.uid() = host_id
        and exists (
            select 1 from group_members
            where group_members.group_id = rooms.group_id
            and group_members.user_id = auth.uid()
        )
    );

create policy "Enable update for room host" on rooms
    for update using (
        auth.uid() = host_id
    );

create policy "Enable delete for room host" on rooms
    for delete using (
        auth.uid() = host_id
    );

-- Create view for rooms with host info
create or replace view rooms_with_host as
select 
    r.*,
    g.name as group_name,
    p.username as host_username
from rooms r
join groups g on g.id = r.group_id
join profiles p on p.id = r.host_id;

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on rooms to authenticated;
grant all on rooms_with_host to authenticated;

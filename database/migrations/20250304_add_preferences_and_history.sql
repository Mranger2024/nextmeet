-- Create user preferences table
create table if not exists user_preferences (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete cascade not null,
    theme text default 'dark' check (theme in ('dark', 'light')) not null,
    notifications_enabled boolean default true not null,
    sound_enabled boolean default true not null,
    video_quality text default 'auto' check (video_quality in ('low', 'medium', 'high', 'auto')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_user_preferences unique (user_id)
);

-- Create room history table
create table if not exists room_history (
    id uuid default gen_random_uuid() primary key,
    room_id uuid references rooms(id) on delete cascade not null,
    group_id uuid references groups(id) on delete cascade not null,
    host_id uuid references profiles(id) on delete cascade not null,
    started_at timestamp with time zone not null,
    ended_at timestamp with time zone,
    participant_count integer default 0 not null,
    duration interval generated always as (ended_at - started_at) stored,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create view for room history with details
create or replace view room_history_with_details as
select 
    rh.*,
    r.name as room_name,
    g.name as group_name,
    p.username as host_username,
    p.display_name as host_display_name
from room_history rh
join rooms r on r.id = rh.room_id
join groups g on g.id = rh.group_id
join profiles p on p.id = rh.host_id;

-- Enable RLS
alter table user_preferences enable row level security;
alter table room_history enable row level security;

-- Create RLS policies for user preferences
create policy "Users can view own preferences" on user_preferences
    for select using (auth.uid() = user_id);

create policy "Users can update own preferences" on user_preferences
    for update using (auth.uid() = user_id);

create policy "Users can insert own preferences" on user_preferences
    for insert with check (auth.uid() = user_id);

-- Create RLS policies for room history
create policy "Group members can view room history" on room_history
    for select using (
        exists (
            select 1 from group_members
            where group_members.group_id = room_history.group_id
            and group_members.user_id = auth.uid()
        )
    );

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on user_preferences to authenticated;
grant all on room_history to authenticated;
grant all on room_history_with_details to authenticated;

-- Create indexes
create index if not exists idx_user_preferences_user_id on user_preferences(user_id);
create index if not exists idx_room_history_room_id on room_history(room_id);
create index if not exists idx_room_history_group_id on room_history(group_id);
create index if not exists idx_room_history_host_id on room_history(host_id);
create index if not exists idx_room_history_started_at on room_history(started_at);

-- Insert default preferences for existing users
insert into user_preferences (user_id)
select id from profiles
where not exists (
    select 1 from user_preferences up where up.user_id = profiles.id
);

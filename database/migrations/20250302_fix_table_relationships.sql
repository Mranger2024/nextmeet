-- Drop existing tables and start fresh
drop table if exists friends cascade;
drop table if exists presence cascade;
drop table if exists notifications cascade;

-- Create profiles table if not exists
create table if not exists profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    display_name text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create presence table
create table presence (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete cascade not null,
    online boolean default false not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'offline' check (status in ('online', 'away', 'busy', 'offline')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_user_presence unique (user_id)
);

-- Create friends table
create table friends (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete cascade not null,
    friend_id uuid references profiles(id) on delete cascade not null,
    status text check (status in ('pending', 'accepted', 'rejected', 'deleted')) not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_friendship unique (user_id, friend_id)
);

-- Create notifications table
create table notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete cascade not null,
    from_user_id uuid references profiles(id) on delete cascade not null,
    type text check (type in ('friend_request', 'friend_accepted', 'message', 'room_invite')) not null,
    content text not null,
    read boolean default false not null,
    metadata jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_presence_user_id on presence(user_id);
create index if not exists idx_presence_online on presence(online);
create index if not exists idx_presence_status on presence(status);
create index if not exists idx_friends_user_id on friends(user_id);
create index if not exists idx_friends_friend_id on friends(friend_id);
create index if not exists idx_friends_status on friends(status);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_notifications_from_user_id on notifications(from_user_id);
create index if not exists idx_notifications_read on notifications(read);

-- Enable RLS
alter table profiles enable row level security;
alter table presence enable row level security;
alter table friends enable row level security;
alter table notifications enable row level security;

-- Create RLS policies
create policy "Enable read access for users" on friends for select
    to authenticated
    using (auth.uid() in (user_id, friend_id));

create policy "Enable insert access for users" on friends for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Enable update access for users" on friends for update
    to authenticated
    using (auth.uid() in (user_id, friend_id));

create policy "Enable delete access for users" on friends for delete
    to authenticated
    using (auth.uid() in (user_id, friend_id));

create policy "Enable read access for notifications" on notifications for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable insert access for notifications" on notifications for insert
    to authenticated
    with check (auth.uid() = from_user_id);

create policy "Enable update access for notifications" on notifications for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable delete access for notifications" on notifications for delete
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable read access for presence" on presence for select
    to authenticated
    using (true);

create policy "Enable update own presence" on presence for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable insert own presence" on presence for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on profiles to authenticated;
grant all on presence to authenticated;
grant all on friends to authenticated;
grant all on notifications to authenticated;

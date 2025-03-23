-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    display_name text,
    avatar_url text,
    status text default 'offline',
    bio text,
    gender text,
    country text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User matching preferences
create table if not exists user_preferences (
    user_id uuid references profiles(id) on delete cascade primary key,
    preferred_gender text[], -- Array of preferred genders to match with
    preferred_countries text[], -- Array of preferred countries
    interests text[], -- Array of interests/hobbies
    languages text[], -- Array of spoken languages
    matching_enabled boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friendships
create table if not exists friendships (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) on delete cascade,
    friend_id uuid references profiles(id) on delete cascade,
    status text default 'pending', -- pending, accepted, blocked
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, friend_id)
);

-- Groups
create table if not exists groups (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    avatar_url text,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Group members
create table if not exists group_members (
    id uuid default uuid_generate_v4() primary key,
    group_id uuid references groups(id) on delete cascade,
    user_id uuid references profiles(id) on delete cascade,
    role text default 'member', -- admin, moderator, member
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(group_id, user_id)
);

-- Rooms
create table if not exists rooms (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    room_type text default 'public', -- public, private, group
    group_id uuid references groups(id) on delete cascade,
    created_by uuid references profiles(id) on delete set null,
    is_active boolean default true,
    max_participants int default 10,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Room participants
create table if not exists room_participants (
    id uuid default uuid_generate_v4() primary key,
    room_id uuid references rooms(id) on delete cascade,
    user_id uuid references profiles(id) on delete cascade,
    joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
    left_at timestamp with time zone,
    unique(room_id, user_id)
);

-- Room history
create table if not exists room_history (
    id uuid default uuid_generate_v4() primary key,
    room_id uuid references rooms(id) on delete cascade,
    user_id uuid references profiles(id) on delete cascade,
    action text not null, -- joined, left, created, ended
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages (for both direct and group messages)
create table if not exists messages (
    id uuid default uuid_generate_v4() primary key,
    sender_id uuid references profiles(id) on delete set null,
    receiver_id uuid references profiles(id) on delete cascade,
    group_id uuid references groups(id) on delete cascade,
    content text not null,
    message_type text default 'text', -- text, image, video, file
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    check (
        (receiver_id is not null and group_id is null) or
        (receiver_id is null and group_id is not null)
    )
);

-- Notifications
create table if not exists notifications (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references profiles(id) on delete cascade,
    type text not null, -- friend_request, message, group_invite, etc.
    title text not null,
    content text not null,
    related_user_id uuid references profiles(id) on delete set null,
    related_group_id uuid references groups(id) on delete set null,
    related_room_id uuid references rooms(id) on delete set null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key for notifications
alter table notifications 
add constraint notifications_from_user_id_fkey 
foreign key (from_user_id) 
references auth.users(id) 
on delete cascade;

-- User settings table
create table if not exists user_settings (
    user_id uuid references auth.users on delete cascade primary key,
    settings jsonb not null default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Friends table for managing friend relationships
drop policy if exists "Enable read access for users" on friends;
drop policy if exists "Enable insert access for users" on friends;
drop policy if exists "Enable update access for users" on friends;
drop policy if exists "Enable delete access for users" on friends;
drop policy if exists "Enable notification access for users" on notifications;

drop table if exists friends;

create table friends (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    friend_id uuid references auth.users on delete cascade not null,
    status text check (status in ('pending', 'accepted', 'rejected', 'deleted')) not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_friendship unique (user_id, friend_id)
);

create index if not exists idx_friends_user_id on friends(user_id);
create index if not exists idx_friends_friend_id on friends(friend_id);
create index if not exists idx_friends_status on friends(status);

alter table friends enable row level security;
alter table notifications enable row level security;

-- Create RLS policies for friends
create policy "Enable read access for users"
    on friends for select
    to authenticated
    using (auth.uid() in (user_id, friend_id));

create policy "Enable insert access for users"
    on friends for insert
    to authenticated
    with check (
        -- Allow users to create friend requests
        auth.uid() in (user_id, friend_id) and
        -- Prevent duplicate friendships
        not exists (
            select 1 from friends
            where (user_id = new.user_id and friend_id = new.friend_id)
               or (user_id = new.friend_id and friend_id = new.user_id)
        )
    );

create policy "Enable update access for users"
    on friends for update
    to authenticated
    using (auth.uid() in (user_id, friend_id));

create policy "Enable delete access for users"
    on friends for delete
    to authenticated
    using (auth.uid() in (user_id, friend_id));

-- Create RLS policies for notifications
drop policy if exists "Enable notification access for users" on notifications;

create policy "Enable read access for notifications"
    on notifications for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable insert access for notifications"
    on notifications for insert
    to authenticated
    with check (auth.uid() = from_user_id);

create policy "Enable update access for notifications"
    on notifications for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable delete access for notifications"
    on notifications for delete
    to authenticated
    using (auth.uid() = user_id);

grant usage on schema public to authenticated;
grant all on friends to authenticated;
grant all on notifications to authenticated;

-- Create indexes for better query performance
create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_friendships_user_id on friendships(user_id);
create index if not exists idx_friendships_friend_id on friendships(friend_id);
create index if not exists idx_group_members_group_id on group_members(group_id);
create index if not exists idx_group_members_user_id on group_members(user_id);
create index if not exists idx_messages_sender_id on messages(sender_id);
create index if not exists idx_messages_receiver_id on messages(receiver_id);
create index if not exists idx_messages_group_id on messages(group_id);
create index if not exists idx_notifications_user_id on notifications(user_id);
create index if not exists idx_room_participants_room_id on room_participants(room_id);
create index if not exists idx_room_history_room_id on room_history(room_id);

-- RLS (Row Level Security) Policies
alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table friendships enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table rooms enable row level security;
alter table room_participants enable row level security;
alter table room_history enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table user_settings enable row level security;

-- Enable RLS for profiles
alter table profiles enable row level security;

-- Allow users to create their profile during signup (when session might not be fully established)
create policy "Enable insert for authentication users only"
    on profiles for insert
    with check (true);  -- Allow initial profile creation

-- Allow users to view their own profile
create policy "Users can view own profile"
    on profiles for select
    using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

-- Allow users to view other users' basic profile info
create policy "Users can view other profiles"
    on profiles for select
    using (true);

-- Notifications table policies
create policy "Users can view their own notifications"
    on notifications for select
    using (auth.uid() = user_id);

create policy "Users can insert notifications for others"
    on notifications for insert
    with check (true);  -- Allow system and other users to create notifications

create policy "Users can update their own notifications"
    on notifications for update
    using (auth.uid() = user_id);

-- User settings table policies
create policy "Users can view their own settings"
    on user_settings for select
    using (auth.uid() = user_id);

create policy "Users can insert their own settings"
    on user_settings for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own settings"
    on user_settings for update
    using (auth.uid() = user_id);

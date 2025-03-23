-- Drop existing policies if they exist
drop policy if exists "Enable read access for users" on friends;
drop policy if exists "Enable insert access for users" on friends;
drop policy if exists "Enable update access for users" on friends;
drop policy if exists "Enable delete access for users" on friends;

-- Drop and recreate the table to ensure clean state
drop table if exists friends;

-- Create friends table
create table friends (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    friend_id uuid references auth.users on delete cascade not null,
    status text check (status in ('pending', 'accepted', 'rejected', 'deleted')) not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_friendship unique (user_id, friend_id)
);

-- Create indexes
create index if not exists idx_friends_user_id on friends(user_id);
create index if not exists idx_friends_friend_id on friends(friend_id);
create index if not exists idx_friends_status on friends(status);

-- Enable RLS
alter table friends enable row level security;

-- Create RLS policies
create policy "Enable read access for users"
    on friends for select
    to authenticated
    using (auth.uid() in (user_id, friend_id));

create policy "Enable insert access for users"
    on friends for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Enable update access for users"
    on friends for update
    to authenticated
    using (auth.uid() in (user_id, friend_id));

create policy "Enable delete access for users"
    on friends for delete
    to authenticated
    using (auth.uid() in (user_id, friend_id));

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on friends to authenticated;

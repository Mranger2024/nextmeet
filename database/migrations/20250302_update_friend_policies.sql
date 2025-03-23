-- Drop existing policies
drop policy if exists "Enable read access for users" on friends;
drop policy if exists "Enable insert access for users" on friends;
drop policy if exists "Enable update access for users" on friends;
drop policy if exists "Enable delete access for users" on friends;
drop policy if exists "Enable notification access for users" on notifications;
drop policy if exists "Enable read access for notifications" on notifications;
drop policy if exists "Enable insert access for notifications" on notifications;
drop policy if exists "Enable update access for notifications" on notifications;
drop policy if exists "Enable delete access for notifications" on notifications;

-- Enable RLS
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
        -- Allow users to create friend requests as themselves
        auth.uid() = user_id and
        -- Prevent duplicate friendships
        not exists (
            select 1 from friends f
            where (f.user_id = friends.user_id and f.friend_id = friends.friend_id)
               or (f.user_id = friends.friend_id and f.friend_id = friends.user_id)
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

-- Add foreign key for notifications if not exists
do $$ 
begin
    if not exists (
        select 1 from information_schema.table_constraints 
        where constraint_name = 'notifications_from_user_id_fkey'
    ) then
        alter table notifications 
        add constraint notifications_from_user_id_fkey 
        foreign key (from_user_id) 
        references auth.users(id) 
        on delete cascade;
    end if;
end $$;

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on friends to authenticated;
grant all on notifications to authenticated;

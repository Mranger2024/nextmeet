-- Drop existing foreign key constraints if they exist
do $$ 
begin
    if exists (select 1 from information_schema.table_constraints where constraint_name = 'profiles_id_fkey') then
        alter table profiles drop constraint profiles_id_fkey;
    end if;
end $$;

-- Make profiles.id reference auth.users.id
alter table profiles
    add constraint profiles_id_fkey
    foreign key (id)
    references auth.users(id)
    on delete cascade;

-- Add foreign key constraints for friends table
alter table friends
    add constraint friends_user_id_fkey
    foreign key (user_id)
    references profiles(id)
    on delete cascade;

alter table friends
    add constraint friends_friend_id_fkey
    foreign key (friend_id)
    references profiles(id)
    on delete cascade;

-- Add foreign key constraints for presence table
alter table presence
    add constraint presence_user_id_fkey
    foreign key (user_id)
    references profiles(id)
    on delete cascade;

-- Add foreign key constraints for notifications table
alter table notifications
    add constraint notifications_user_id_fkey
    foreign key (user_id)
    references profiles(id)
    on delete cascade;

alter table notifications
    add constraint notifications_from_user_id_fkey
    foreign key (from_user_id)
    references profiles(id)
    on delete cascade;

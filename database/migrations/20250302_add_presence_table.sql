-- Create presence table
create table if not exists presence (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users on delete cascade not null,
    online boolean default false not null,
    last_seen timestamp with time zone default timezone('utc'::text, now()) not null,
    status text default 'offline' check (status in ('online', 'away', 'busy', 'offline')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_user_presence unique (user_id)
);

-- Create indexes
create index if not exists idx_presence_user_id on presence(user_id);
create index if not exists idx_presence_online on presence(online);
create index if not exists idx_presence_status on presence(status);

-- Enable RLS
alter table presence enable row level security;

-- Create RLS policies
create policy "Enable read access for presence"
    on presence for select
    to authenticated
    using (true); -- Everyone can see presence status

create policy "Enable update own presence"
    on presence for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Enable insert own presence"
    on presence for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Function to update last_seen
create or replace function update_last_seen()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update last_seen
drop trigger if exists presence_last_seen_trigger on presence;
create trigger presence_last_seen_trigger
    before update on presence
    for each row
    execute function update_last_seen();

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant all on presence to authenticated;

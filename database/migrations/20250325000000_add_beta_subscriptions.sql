-- Add beta_subscriptions table for collecting beta program interest

create table if not exists beta_subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete set null,
    name text not null,
    email text not null,
    mobile_number text not null check (length(mobile_number) = 10),
    country text,
    gender text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_beta_subscriptions_user_id on beta_subscriptions(user_id);
create index if not exists idx_beta_subscriptions_country on beta_subscriptions(country);
create index if not exists idx_beta_subscriptions_gender on beta_subscriptions(gender);

-- Enable RLS
alter table beta_subscriptions enable row level security;

-- RLS policies for beta_subscriptions
create policy "Users can view their own beta subscriptions"
    on beta_subscriptions for select
    using (auth.uid() = user_id);

create policy "Anyone can insert beta subscriptions"
    on beta_subscriptions for insert
    with check (true);

create policy "System can update beta subscriptions"
    on beta_subscriptions for update
    using (true);

-- Function to auto-populate country and gender from profiles
create or replace function auto_populate_beta_subscription_profile_data()
returns trigger as $$
begin
    -- Only try to populate from profiles if user_id is not null
    if new.user_id is not null then
        -- Get country and gender from profiles table
        select country, gender into new.country, new.gender
        from profiles
        where id = new.user_id;
    end if;
    return new;
end;
$$ language plpgsql;

-- Trigger to auto-populate profile data on insert
create trigger auto_populate_beta_subscription_profile_data_trigger
    before insert on beta_subscriptions
    for each row
    execute function auto_populate_beta_subscription_profile_data();
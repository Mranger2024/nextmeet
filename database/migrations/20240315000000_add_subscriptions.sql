-- Add subscriptions and payments tables for Cashfree integration

-- Subscription plans table
create table if not exists subscription_plans (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    price numeric(10,2) not null,
    currency text default 'INR',
    duration_months integer not null,
    features jsonb default '{}',
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User subscriptions table
create table if not exists subscriptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    plan_id uuid references subscription_plans(id) on delete restrict,
    status text not null check (status in ('active', 'cancelled', 'expired', 'pending')),
    cashfree_subscription_id text unique,
    current_period_start timestamp with time zone not null,
    current_period_end timestamp with time zone not null,
    cancel_at_period_end boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payment orders table
create table if not exists payment_orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade,
    subscription_id uuid references subscriptions(id) on delete cascade,
    cashfree_order_id text unique not null,
    amount numeric(10,2) not null,
    currency text default 'INR',
    status text not null check (status in ('created', 'paid', 'failed')),
    payment_session_id text,
    payment_method text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_subscriptions_plan_id on subscriptions(plan_id);
create index if not exists idx_payment_orders_user_id on payment_orders(user_id);
create index if not exists idx_payment_orders_subscription_id on payment_orders(subscription_id);

-- Enable RLS
alter table subscription_plans enable row level security;
alter table subscriptions enable row level security;
alter table payment_orders enable row level security;

-- RLS policies for subscription_plans
create policy "Anyone can view active subscription plans"
    on subscription_plans for select
    using (is_active = true);

-- RLS policies for subscriptions
create policy "Users can view their own subscriptions"
    on subscriptions for select
    using (auth.uid() = user_id);

create policy "System can insert subscriptions"
    on subscriptions for insert
    with check (true);

create policy "System can update subscriptions"
    on subscriptions for update
    using (true);

-- RLS policies for payment_orders
create policy "Users can view their own payment orders"
    on payment_orders for select
    using (auth.uid() = user_id);

create policy "System can insert payment orders"
    on payment_orders for insert
    with check (true);

create policy "System can update payment orders"
    on payment_orders for update
    using (true);
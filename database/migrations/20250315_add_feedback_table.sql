-- Create feedback table
create table if not exists feedback (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users on delete cascade not null,
    type text check (type in ('general', 'complaint', 'bug')) not null,
    rating integer check (rating >= 0 and rating <= 5),
    message text not null,
    status text check (status in ('pending', 'in_progress', 'resolved', 'closed')) not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists idx_feedback_user_id on feedback(user_id);
create index if not exists idx_feedback_type on feedback(type);
create index if not exists idx_feedback_status on feedback(status);

-- Enable RLS
alter table feedback enable row level security;

-- Create RLS policies
create policy "Users can create feedback"
    on feedback for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can view their own feedback"
    on feedback for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can update their own feedback"
    on feedback for update
    to authenticated
    using (auth.uid() = user_id);

-- Create FAQ table
create table if not exists faq (
    id uuid default uuid_generate_v4() primary key,
    question text not null,
    answer text not null,
    category text check (category in ('account', 'technical', 'billing', 'features')) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for FAQ
alter table faq enable row level security;

-- Create RLS policies for FAQ
create policy "Everyone can view FAQs"
    on faq for select
    to authenticated
    using (true);
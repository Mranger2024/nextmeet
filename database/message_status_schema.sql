-- Create message status table
create table if not exists chat_message_status (
    id uuid default gen_random_uuid() primary key,
    chat_id uuid references chats(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_delivered_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(chat_id, user_id)
);

-- Create index for better performance
create index if not exists idx_chat_message_status_chat_id on chat_message_status(chat_id);
create index if not exists idx_chat_message_status_user_id on chat_message_status(user_id);

-- Enable RLS
alter table chat_message_status enable row level security;

-- Create policies for message status
create policy "Users can view message status"
on chat_message_status for select
to authenticated
using (
    chat_id in (
        select chat_id from chat_participants
        where user_id = auth.uid()
    )
);

create policy "Users can update their message status"
on chat_message_status for insert
to authenticated
with check (
    user_id = auth.uid() and
    chat_id in (
        select chat_id from chat_participants
        where user_id = auth.uid()
    )
);

create policy "Users can update their message status"
on chat_message_status for update
to authenticated
using (
    user_id = auth.uid()
)
with check (
    user_id = auth.uid()
);

-- Create function to update message status
create or replace function update_message_status() returns trigger as $$
begin
    update chat_message_status
    set updated_at = now()
    where id = new.id;
    return new;
end;
$$ language plpgsql;

-- Create trigger to update message status
create trigger update_message_status_trigger
before update on chat_message_status
for each row
execute function update_message_status();

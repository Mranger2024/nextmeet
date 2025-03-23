-- Add status columns to chat_messages
alter table chat_messages 
add column if not exists seen boolean default false,
add column if not exists delivered boolean default false;

-- Add typing status table
create table if not exists chat_typing_status (
    id uuid default gen_random_uuid() primary key,
    chat_id uuid references chats(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    typing boolean default false,
    last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(chat_id, user_id)
);

-- Create index for better performance
create index if not exists idx_chat_typing_status_chat_id on chat_typing_status(chat_id);

-- Enable RLS
alter table chat_typing_status enable row level security;

-- Create policies for typing status
create policy "Users can update their typing status"
on chat_typing_status for all
to authenticated
using (
    user_id = auth.uid()
)
with check (
    user_id = auth.uid()
);

-- Create function to clean up old typing statuses
create or replace function cleanup_typing_status() returns trigger as $$
begin
    delete from chat_typing_status
    where last_updated < now() - interval '1 seconds';
    return new;
end;
$$ language plpgsql;

-- Create trigger to clean up old typing statuses
create trigger cleanup_typing_status_trigger
after insert or update on chat_typing_status
execute function cleanup_typing_status();

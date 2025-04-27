-- Create chat-files bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('chat-files', 'chat-files', true)
on conflict (id) do nothing;

-- Drop existing policies
drop policy if exists "Authenticated users can upload chat files" on storage.objects;
drop policy if exists "Chat participants can view files" on storage.objects;

-- Create policies for chat files
create policy "Authenticated users can upload chat files"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'chat-files' and
    (
        -- Extract chat_id from path and verify user is a participant
        exists (
            select 1 from chat_participants
            where chat_id = (regexp_match(name, '^([^/]+)/')[1])::uuid
            and user_id = auth.uid()
        )
    )
);

create policy "Chat participants can view files"
on storage.objects for select
to authenticated
using (
    bucket_id = 'chat-files' and
    (
        -- Extract chat_id from path and verify user is a participant
        exists (
            select 1 from chat_participants
            where chat_id = (regexp_match(name, '^([^/]+)/')[1])::uuid
            and user_id = auth.uid()
        )
    )
);
